import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/quiz/[id] - Fetch quiz assignment for a student to take
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = parseInt(params.id);
    if (isNaN(assignmentId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const assignment = await (prisma as any).quizAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        quiz: {
          include: {
            teacher: { select: { name: true, surname: true } },
            // Return questions WITHOUT answers (stripped server-side)
            questions: {
              select: {
                id: true,
                question: true,
                options: true,
                difficulty: true,
                // intentionally omitting 'answer'
              },
            },
          },
        },
        class: { select: { name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const now = new Date();
    if (now < new Date(assignment.startTime)) {
      return NextResponse.json(
        { error: "This quiz is not available yet." },
        { status: 403 }
      );
    }
    if (now > new Date(assignment.endTime)) {
      return NextResponse.json(
        { error: "This quiz is closed." },
        { status: 403 }
      );
    }

    return NextResponse.json(assignment);
  } catch (err) {
    console.error("Quiz fetch error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
