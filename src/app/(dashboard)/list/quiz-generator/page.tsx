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
        <div className="panel overflow-hidden">
          <div className="px-6 py-5 border-b border-line">
            <h2 className="text-lg font-semibold text-ink">My Saved Quizzes</h2>
            <p className="text-sm text-ink-subtle mt-0.5">Quizzes you&apos;ve generated and saved</p>
          </div>
          <div className="divide-y divide-line">
            {savedQuizzes.length === 0 ? (
              <div className="px-6 py-12 text-center text-ink-subtle">
                <div className="mx-auto w-10 h-10 rounded-full bg-surface-subtle border border-line flex items-center justify-center mb-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>
                </div>
                <p className="text-sm">No quizzes yet. Generate one on the left.</p>
              </div>
            ) : (
              savedQuizzes.map((q: any) => (
                <div key={q.id} className="px-6 py-4 hover:bg-surface-subtle transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{q.title}</p>
                      <p className="text-xs text-ink-subtle mt-0.5">
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(q.createdAt))}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs shrink-0">
                      <span className="chip">
                        {q._count.questions} Qs
                      </span>
                      <span className="chip">
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
