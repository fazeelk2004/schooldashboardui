import { getCurrentUser } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuizGeneratorClient from "@/components/QuizGeneratorClient";

export default async function QuizGeneratorPage() {
  const { userId, role } = getCurrentUser();

  if (role !== "teacher") redirect("/");

  // Get the teacher's schoolId and classes they supervise or teach
  const teacher = await (prisma as any).teacher.findUnique({
    where: { id: userId! },
    select: { id: true, schoolId: true },
  });

  if (!teacher) redirect("/");

  // Get all classes in the same school for assigning
  const classes = await (prisma as any).class.findMany({
    where: { schoolId: teacher.schoolId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Get quizzes this teacher has created, along with assignment count
  const savedQuizzes = await (prisma as any).quiz.findMany({
    where: { teacherId: userId!, schoolId: teacher.schoolId },
    include: {
      _count: { select: { questions: true, quizAssignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Generator */}
        <QuizGeneratorClient
          teacherId={teacher.id}
          schoolId={teacher.schoolId}
          classes={classes}
        />

        {/* Right: Saved Quizzes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">📋 My Saved Quizzes</h2>
            <p className="text-sm text-gray-400 mt-0.5">Quizzes you&apos;ve generated and saved</p>
          </div>
          <div className="divide-y divide-gray-50">
            {savedQuizzes.length === 0 ? (
              <div className="px-6 py-10 text-center text-gray-400">
                <p className="text-4xl mb-2">📝</p>
                <p>No quizzes yet. Generate one on the left!</p>
              </div>
            ) : (
              savedQuizzes.map((q: any) => (
                <div key={q.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{q.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(q.createdAt))}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs shrink-0">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {q._count.questions} Qs
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        {q._count.quizAssignments} assigned
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
