import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { assertFeature, PlanLimitError } from "@/lib/plans";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ---------- helpers ---------- */
function getExtSafe(name = "") {
  return path.extname(name).toLowerCase();
}

async function extractTextFromPptx(filePath: string): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const { XMLParser } = await import("fast-xml-parser");
  const buf = await fs.readFile(filePath);
  const zip = await JSZip.loadAsync(new Uint8Array(buf));
  const slideFiles = Object.keys(zip.files)
    .filter((p) => p.startsWith("ppt/slides/slide") && p.endsWith(".xml"))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml$/)?.[1] || "0", 10);
      return na - nb;
    });

  const parser = new XMLParser({ ignoreAttributes: false });
  const parts: string[] = [];

  function collectAText(node: unknown): void {
    if (node == null) return;
    if (Array.isArray(node)) { node.forEach(collectAText); return; }
    if (typeof node === "object") {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (k.endsWith(":t") && typeof v === "string") parts.push(v);
        else collectAText(v);
      }
    }
  }

  for (const p of slideFiles) {
    const xml = await zip.files[p].async("string");
    const json = parser.parse(xml);
    collectAText(json);
    parts.push("\n");
  }
  return parts.join(" ").replace(/\s*\n\s*/g, "\n").trim();
}

async function extractText(filePath: string, mimetype: string, originalname: string): Promise<string> {
  const ext = getExtSafe(originalname);
  const isPDF = mimetype === "application/pdf" || ext === ".pdf" || mimetype === "application/octet-stream";
  const isDOCX = mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === ".docx";
  const isPPTX = mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || ext === ".pptx";
  const isTXT = mimetype?.startsWith("text/") || ext === ".txt";

  if (isPDF) {
    const pdfParseModule: unknown = await import("pdf-parse");
    const mod = pdfParseModule as Record<string, unknown>;
    const pdfParse =
      typeof mod.default === "function"
        ? (mod.default as (b: Buffer) => Promise<{ text: string }>)
        : (Object.values(mod).find((v) => typeof v === "function") as
            | ((b: Buffer) => Promise<{ text: string }>)
            | undefined);
    if (!pdfParse) throw new Error("pdf-parse could not be loaded");
    const buf = await fs.readFile(filePath);
    const data = await pdfParse(buf);
    return (data.text || "").trim();
  }
  if (isDOCX) {
    const mammoth = await import("mammoth");
    const res = await mammoth.extractRawText({ path: filePath });
    return (res.value || "").trim();
  }
  if (isPPTX) {
    return (await extractTextFromPptx(filePath)).trim();
  }
  if (isTXT) return (await fs.readFile(filePath, "utf8")).trim();

  throw new Error("Unsupported file type. Please upload PDF, DOCX, PPTX, or TXT.");
}

/* ---------- route ---------- */
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let tempPath: string | null = null;

  try {
    const { userId, sessionClaims } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }
    let schoolId = (sessionClaims?.metadata as { schoolId?: number })?.schoolId;
    if (!schoolId) {
      const teacher = await (prisma as any).teacher.findUnique({
        where: { id: userId },
        select: { schoolId: true },
      });
      schoolId = teacher?.schoolId;
    }
    if (!schoolId) {
      return NextResponse.json({ error: "No school associated with this account." }, { status: 403 });
    }
    try {
      await assertFeature(schoolId, "aiQuiz");
    } catch (e) {
      if (e instanceof PlanLimitError) {
        return NextResponse.json({ error: e.message }, { status: 402 });
      }
      throw e;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });

    // Save to temp file
    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);
    tempPath = path.join(os.tmpdir(), `quiz_upload_${Date.now()}_${file.name}`);
    await fs.writeFile(tempPath, uint8);

    const questionCount = Math.max(1, Math.min(20, parseInt(formData.get("questionCount") as string || "5", 10)));
    const diffRaw = String(formData.get("difficulty") || "mixed").toLowerCase();
    const allowedDiff = new Set(["easy", "medium", "hard", "mixed"]);
    const difficulty = allowedDiff.has(diffRaw) ? diffRaw : "mixed";

    const text = await extractText(tempPath, file.type, file.name);
    if (!text || text.length < 50)
      return NextResponse.json(
        { error: "Text extraction failed (too little text or image-only content)." },
        { status: 422 }
      );

    const schema = {
      type: "object",
      additionalProperties: false,
      required: ["quiz"],
      properties: {
        quiz: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["question", "options", "answer", "difficulty"],
            properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
              answer: { type: "string" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            },
          },
        },
      },
    };

    const prompt = `
You are an expert teaching assistant.

Task:
- From the provided text, create ${questionCount} multiple-choice questions (MCQs).
- Each MCQ must have exactly 4 options and 1 correct answer that appears verbatim in the options.
- Tag each MCQ with difficulty: "easy", "medium", or "hard".
- Difficulty mode selected by user: "${difficulty}".
  - If "mixed": distribute evenly across all 3 levels.
  - If "easy" | "medium" | "hard": make all questions at that level.

Return ONLY valid JSON in this shape:
{ "quiz": [ { "question": "...", "options": ["A","B","C","D"], "answer": "A", "difficulty": "easy|medium|hard" } ] }

Text:
"""${text.slice(0, 40000)}"""`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const outText = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(outText);
    const quiz = Array.isArray(parsed.quiz) ? parsed.quiz : [];

    return NextResponse.json({ quiz, type: "mcq" });
  } catch (err: unknown) {
    console.error("❌ Quiz generation error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  } finally {
    if (tempPath) {
      try { await fs.unlink(tempPath); } catch {}
    }
  }
}
