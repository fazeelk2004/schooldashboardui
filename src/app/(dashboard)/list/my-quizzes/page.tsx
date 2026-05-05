import { getCurrentUser } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyQuizzesPage() {
  const { userId, role } = getCurrentUser();

  if (role !== "student") redirect("/");

  const student = await (prisma as any).student.findUnique({
    where: { id: userId! },
    select: { classId: true, schoolId: true },
  });

  if (!student) redirect("/");

  const quizAssignments = await (prisma as any).quizAssignment.findMany({
    where: {
      classId: student.classId,
      schoolId: student.schoolId,
    },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          type: true,
          teacher: { select: { name: true, surname: true } },
          _count: { select: { questions: true } },
        },
      },
      submissions: {
        where: { studentId: userId! },
        select: { id: true, score: true, totalMarks: true, submittedAt: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">My Quizzes</h1>
        <span className="text-sm text-gray-500">
          {quizAssignments.length} assigned
        </span>
      </div>

      {quizAssignments.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-5xl mb-3">🎉</p>
          <p className="font-medium text-gray-600">No quizzes assigned yet!</p>
          <p className="text-sm mt-1">Check back later.</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quizAssignments.map((assignment: any) => {
            const submission = assignment.submissions[0];
            const isCompleted = !!submission;
            const isOverdue = !isCompleted && new Date(assignment.dueDate) < now;
            const percentage = isCompleted
              ? Math.round((submission.score / submission.totalMarks) * 100)
              : null;
            const isLocked = isCompleted && submission.score === 0;

            return (
              <div
                key={assignment.id}
                className="bg-lamaSkyLight rounded-md border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-base flex-1">
                    {assignment.quiz.title}
                  </h3>
                  {isCompleted ? (
                    isLocked ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium shrink-0">
                        🔒 Locked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium shrink-0">
                        ✓ Done
                      </span>
                    )
                  ) : isOverdue ? (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium shrink-0">
                      Overdue
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-lamaYellow text-gray-800 text-xs rounded-full font-medium shrink-0">
                      Pending
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <div>
                    👤 {assignment.quiz.teacher.name} {assignment.quiz.teacher.surname}
                  </div>
                  <div>❓ {assignment.quiz._count.questions} questions</div>
                  <div className={isOverdue ? "text-red-500" : ""}>
                    📅 Due{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(assignment.dueDate))}
                  </div>
                </div>

                <div className="mt-auto">
                  {isCompleted ? (
                    <div className="bg-white rounded-md px-3 py-2 border border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Your Score</span>
                      <span
                        className={`text-lg font-bold ${
                          percentage! >= 70
                            ? "text-green-600"
                            : percentage! >= 40
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {percentage}%{" "}
                        <span className="text-xs font-normal text-gray-400">
                          ({submission.score}/{submission.totalMarks})
                        </span>
                      </span>
                    </div>
                  ) : isOverdue ? (
                    <div className="text-center text-sm text-red-500 py-2 font-medium">
                      Submission window closed
                    </div>
                  ) : (
                    <Link
                      href={`/list/quiz-take/${assignment.id}`}
                      className="block text-center bg-lamaSky text-gray-800 text-sm font-semibold py-2.5 rounded-md hover:bg-lamaSky/80 transition-colors"
                    >
                      Take Quiz →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
