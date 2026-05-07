import { getCurrentUser } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuizGeneratorClient from "@/components/QuizGeneratorClient";
import { getSchoolPlan, PLAN_FEATURES } from "@/lib/plans";

export default async function QuizGeneratorPage() {
  const { userId, role } = getCurrentUser();

  if (role !== "teacher") redirect("/");

  // Get the teacher's schoolId and classes they supervise or teach
  const teacher = await (prisma as any).teacher.findUnique({
    where: { id: userId! },
    select: { id: true, schoolId: true },
  });

  if (!teacher) redirect("/");

  const plan = await getSchoolPlan(teacher.schoolId);
  if (!PLAN_FEATURES[plan].aiQuiz) {
    return (
      <div className="p-4">
        <div className="panel overflow-hidden">
          <div className="px-8 py-12 text-center max-w-2xl mx-auto">
            <div className="mx-auto w-14 h-14 rounded-full bg-surface-subtle border border-line flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.39 4.84L20 8.27l-4 3.9.94 5.5L12 15.1l-4.94 2.6L8 12.17l-4-3.9 5.61-.43L12 2z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-ink">AI Quiz Generation is a Pro feature</h1>
            <p className="text-sm text-ink-subtle mt-2">
              Your school is currently on the <span className="font-medium">{plan}</span> plan.
              Upgrade to <span className="font-medium">Pro</span> to unlock AI-powered quiz generation
              from your lesson materials.
            </p>
            <ul className="text-sm text-ink mt-6 space-y-2 text-left max-w-sm mx-auto">
              <li className="flex gap-2"><span>✓</span> Generate MCQs from PDFs, DOCX, PPTX</li>
              <li className="flex gap-2"><span>✓</span> Choose difficulty &amp; question count</li>
              <li className="flex gap-2"><span>✓</span> Assign quizzes to classes instantly</li>
            </ul>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a
                href="/admin/billing"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium bg-ink text-white hover:opacity-90 transition"
              >
                Upgrade to Pro
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium border border-line text-ink hover:bg-surface-subtle transition"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
