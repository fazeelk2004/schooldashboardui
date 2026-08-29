import { getCurrentUser } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuizGeneratorClient from "@/components/QuizGeneratorClient";
import SavedQuizzesList from "@/components/SavedQuizzesList";
import { getSchoolPlan, PLAN_FEATURES } from "@/lib/plans";
import DashboardWelcome from "@/components/DashboardWelcome";

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
      <div className="dashboard-page p-4 sm:p-6 lg:p-7">
        <div className="dashboard-card overflow-hidden rounded-[26px] border border-line/75 bg-surface">
          <div className="px-8 py-12 text-center max-w-2xl mx-auto">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand/15 bg-brand/10 text-brand shadow-lg shadow-brand/10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.39 4.84L20 8.27l-4 3.9.94 5.5L12 15.1l-4.94 2.6L8 12.17l-4-3.9 5.61-.43L12 2z"/>
              </svg>
            </div>
            <span className="dashboard-section-kicker">Neura AI</span>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-ink">AI Quiz Generation is a Pro feature</h1>
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
                className="btn-primary px-5 py-3"
              >
                Upgrade to Pro
              </a>
              <a
                href="/"
                className="landing-button-secondary px-5 py-3 text-sm"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get only classes where this teacher has lessons
  const classes = await (prisma as any).class.findMany({
    where: {
      schoolId: teacher.schoolId,
      lessons: { some: { teacherId: userId! } },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Get quizzes this teacher has created, with assignment count and class IDs already assigned
  const savedQuizzes = await (prisma as any).quiz.findMany({
    where: { teacherId: userId!, schoolId: teacher.schoolId },
    include: {
      _count: { select: { questions: true, quizAssignments: true } },
      quizAssignments: { select: { classId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Teacher · Neura AI"
        title="Create better quizzes, faster."
        description="Turn lesson material into a thoughtful assessment, review every question, and assign it to the right class."
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,.95fr)]">
        {/* Left: Generator */}
        <QuizGeneratorClient
          teacherId={teacher.id}
          schoolId={teacher.schoolId}
          classes={classes}
        />

        {/* Right: Saved Quizzes */}
        <SavedQuizzesList
          schoolId={teacher.schoolId}
          classes={classes}
          quizzes={savedQuizzes}
        />
      </div>
    </div>
  );
}
