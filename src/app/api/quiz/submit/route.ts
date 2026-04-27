import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST /api/quiz/submit
// Body: { quizAssignmentId, answers: [{ questionId, studentAnswer }] }
export async function POST(req: NextRequest) {
  try {
    // Get studentId securely from Clerk auth (not from client body)
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const studentId = userId;

    const body = await req.json();
    const { quizAssignmentId, answers } = body as {
      quizAssignmentId: number;
      answers: { questionId: number; studentAnswer: string }[];
    };

    if (!quizAssignmentId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Check if already submitted
    const existing = await (prisma as any).quizSubmission.findUnique({
      where: { quizAssignmentId_studentId: { quizAssignmentId, studentId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Quiz already submitted" }, { status: 409 });
    }

    // Get the quizId from the assignment
    const assignment = await (prisma as any).quizAssignment.findUnique({
      where: { id: quizAssignmentId },
      select: { quizId: true },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Quiz assignment not found" }, { status: 404 });
    }

    // Fetch correct answers from DB
    const questions = await (prisma as any).quizQuestion.findMany({
      where: { quizId: assignment.quizId },
    });

    let score = 0;
    const totalMarks = questions.length;

    // Map questionId -> correct answer
    const answerMap = new Map(
      questions.map((q: { id: number; answer: string }) => [q.id, q.answer])
    );

    for (const a of answers) {
      const correct = answerMap.get(a.questionId) as string | undefined;
      if (correct && a.studentAnswer.trim() === correct.trim()) {
        score++;
      }
    }

    // Create submission with individual answers
    const submission = await (prisma as any).quizSubmission.create({
      data: {
        quizAssignmentId,
        studentId,
        score,
        totalMarks,
        answers: {
          create: answers.map((a) => ({
            quizQuestionId: a.questionId,
            studentAnswer: a.studentAnswer,
          })),
        },
      },
    });

    const percentageScore = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    return NextResponse.json({
      submissionId: submission.id,
      score,
      totalMarks,
      percentage: percentageScore,
    });
  } catch (err) {
    console.error("Quiz submit error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
