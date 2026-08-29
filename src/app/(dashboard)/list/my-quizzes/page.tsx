import { getCurrentUser } from "@/lib/utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardWelcome from "@/components/DashboardWelcome";

const CalendarIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M8 2v4M16 2v4M3 9h18" /></svg>
);

const ClockIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
);

export default async function MyQuizzesPage() {
  const { userId, role } = getCurrentUser();

  if (role !== "student") redirect("/");

  const student = await prisma.student.findUnique({
    where: { id: userId! },
    select: { classId: true, schoolId: true },
  });

  if (!student) redirect("/");

  const quizAssignments = await prisma.quizAssignment.findMany({
    where: { classId: student.classId, schoolId: student.schoolId },
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
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const completed = quizAssignments.filter((item) => item.submissions.length > 0).length;
  const available = quizAssignments.filter((item) => !item.submissions.length && now >= item.startTime && now <= item.endTime).length;
  const upcoming = quizAssignments.filter((item) => !item.submissions.length && now < item.startTime).length;

  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Student · Assessments"
        title="Your quizzes, all in one place."
        description="See what’s ready, what’s coming next, and how you performed—without losing track of a deadline."
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          ["Available now", available, "emerald"],
          ["Coming up", upcoming, "amber"],
          ["Completed", completed, "violet"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className={`quiz-summary-card quiz-summary-${tone} rounded-2xl border border-line/75 bg-surface p-4 shadow-soft sm:p-5`}>
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-subtle sm:text-[10px]">{label}</span>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{value}</p>
          </div>
        ))}
      </div>

      {quizAssignments.length === 0 ? (
        <div className="dashboard-card rounded-[24px] border border-line/75 bg-surface px-6 py-20 text-center shadow-soft">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand"><CalendarIcon /></div>
          <h2 className="mt-5 text-xl font-bold tracking-tight text-ink">You’re all caught up</h2>
          <p className="mt-2 text-sm text-ink-muted">No quizzes have been assigned to your class yet.</p>
        </div>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><span className="dashboard-section-kicker">Assessment timeline</span><h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink">Assigned quizzes</h2></div>
            <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-bold text-ink-muted">{quizAssignments.length} total</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {quizAssignments.map((assignment) => {
              const submission = assignment.submissions[0];
              const isCompleted = !!submission;
              const startAt = new Date(assignment.startTime);
              const endAt = new Date(assignment.endTime);
              const notStarted = !isCompleted && now < startAt;
              const isOverdue = !isCompleted && now > endAt;
              const isOpen = !isCompleted && !notStarted && !isOverdue;
              const percentage = isCompleted && submission.totalMarks > 0
                ? Math.round((submission.score / submission.totalMarks) * 100)
                : 0;
              const isLocked = isCompleted && submission.score === 0;

              const state = isLocked ? "locked" : isCompleted ? "done" : isOverdue ? "closed" : notStarted ? "upcoming" : "available";
              const stateLabel = isLocked ? "Locked" : isCompleted ? "Completed" : isOverdue ? "Closed" : notStarted ? "Upcoming" : "Available";

              return (
                <article key={assignment.id} className="quiz-assignment-card group relative flex min-h-[320px] flex-col overflow-hidden rounded-[22px] border border-line/75 bg-surface p-5 shadow-soft">
                  <span className={`quiz-card-accent quiz-card-accent-${state} absolute inset-x-0 top-0 h-1`} />
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h.01M13 13h3M9 17h.01M13 17h3" /></svg>
                    </span>
                    <span className={`quiz-state-badge quiz-state-${state}`}>{stateLabel}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold leading-snug tracking-[-0.025em] text-ink">{assignment.quiz.title}</h3>
                  <p className="mt-1.5 text-xs font-medium text-ink-subtle">By {assignment.quiz.teacher.name} {assignment.quiz.teacher.surname} · {assignment.quiz._count.questions} questions</p>

                  <div className="mt-5 space-y-2 rounded-2xl border border-line/70 bg-surface-muted/45 p-3.5 text-xs text-ink-muted">
                    <div className="flex items-center gap-2"><CalendarIcon />{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(startAt)}</div>
                    <div className="flex items-center gap-2"><ClockIcon />{new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(startAt)} – {new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(endAt)}</div>
                  </div>

                  <div className="mt-auto pt-5">
                    {isCompleted ? (
                      <div className="flex items-center justify-between rounded-xl border border-line/70 bg-surface-muted/55 px-3.5 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-subtle">Your score</span>
                        <span className={`text-xl font-bold ${percentage >= 70 ? "text-emerald-500" : percentage >= 40 ? "text-amber-500" : "text-rose-500"}`}>{percentage}% <small className="text-[10px] font-medium text-ink-subtle">{submission.score}/{submission.totalMarks}</small></span>
                      </div>
                    ) : isOverdue ? (
                      <p className="rounded-xl bg-rose-500/8 px-3 py-3 text-center text-xs font-bold text-rose-500">Submission window closed</p>
                    ) : notStarted ? (
                      <p className="rounded-xl bg-amber-500/8 px-3 py-3 text-center text-xs font-bold text-amber-600 dark:text-amber-300">Opens {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(startAt)}</p>
                    ) : isOpen ? (
                      <Link href={`/list/quiz-take/${assignment.id}`} className="btn-primary group/button flex w-full gap-2 py-3">Start quiz <ArrowIcon /></Link>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
