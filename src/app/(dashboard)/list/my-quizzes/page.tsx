import { getCurrentUser } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyQuizzesPage() {
  const { userId, role } = getCurrentUser();

  if (role !== "student") redirect("/");

  // Find the student's class
  const student = await (prisma as any).student.findUnique({
    where: { id: userId! },
    select: { classId: true, schoolId: true },
  });

  if (!student) redirect("/");

  // Get all quiz assignments for the student's class
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
      // Check if student already submitted
      submissions: {
        where: { studentId: userId! },
        select: { id: true, score: true, totalMarks: true, submittedAt: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const now = new Date();

  return (
    <div className="p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h1 className="text-white text-xl font-bold">📚 My Quizzes</h1>
          <p className="text-indigo-200 text-sm mt-0.5">Quizzes assigned to your class</p>
        </div>

        {quizAssignments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-5xl mb-3">🎉</p>
            <p className="font-medium text-gray-600">No quizzes assigned yet!</p>
            <p className="text-sm mt-1">Check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {quizAssignments.map((assignment: any) => {
              const submission = assignment.submissions[0];
              const isCompleted = !!submission;
              const isOverdue = !isCompleted && new Date(assignment.dueDate) < now;
              const percentage = isCompleted
                ? Math.round((submission.score / submission.totalMarks) * 100)
                : null;

              return (
                <div key={assignment.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{assignment.quiz.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
                        <span>👤 {assignment.quiz.teacher.name} {assignment.quiz.teacher.surname}</span>
                        <span>❓ {assignment.quiz._count.questions} questions</span>
                        <span className={`${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                          📅 Due {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(assignment.dueDate))}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isCompleted ? (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${percentage! >= 70 ? "text-green-600" : percentage! >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                            {percentage}%
                          </div>
                          <div className="text-xs text-gray-400">{submission.score}/{submission.totalMarks} correct</div>
                          <div className="mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium text-center">
                            ✅ Completed
                          </div>
                        </div>
                      ) : isOverdue ? (
                        <span className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-full font-medium">
                          ⏰ Overdue
                        </span>
                      ) : (
                        <Link
                          href={`/list/quiz-take/${assignment.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          Take Quiz →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
