"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type Question = {
  id: number;
  question: string;
  options: string[];
  difficulty: string;
};

type Assignment = {
  id: number;
  startTime: string;
  endTime: string;
  quiz: {
    title: string;
    teacher: { name: string; surname: string };
    questions: Question[];
  };
  class: { name: string };
};

const ArrowIcon = ({ back = false }: { back?: boolean }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 ${back ? "rotate-180" : ""}`}><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
);

const ShieldIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
);

export default function QuizTakePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<{ score: number; totalMarks: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [clock, setClock] = useState(() => Date.now());

  const assignmentRef = useRef<Assignment | null>(null);
  const answersRef = useRef<Record<number, string>>({});
  const submittedRef = useRef(false);
  const lockedRef = useRef(false);

  useEffect(() => { assignmentRef.current = assignment; }, [assignment]);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submittedRef.current = submitted; }, [submitted]);
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  useEffect(() => {
    fetch(`/api/quiz/${params.id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); router.push("/list/my-quizzes"); return; }
        setAssignment(data);
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load quiz."); router.push("/list/my-quizzes"); });
  }, [params.id, router]);

  useEffect(() => {
    if (!assignment || submitted || locked) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [assignment, submitted, locked]);

  const lockQuiz = useCallback(async () => {
    if (lockedRef.current || submittedRef.current) return;
    const activeAssignment = assignmentRef.current;
    if (!activeAssignment) return;
    lockedRef.current = true;
    setLocked(true);
    try {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizAssignmentId: activeAssignment.id,
          answers: activeAssignment.quiz.questions.map((question) => ({
            questionId: question.id,
            studentAnswer: answersRef.current[question.id] || "",
          })),
        }),
      });
    } catch {
      // The client remains locked even if the network request fails.
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!assignment) return;
    const questions = assignment.quiz.questions;
    const answered = Object.keys(answersRef.current).length;
    if (answered < questions.length) {
      const unanswered = questions.length - answered;
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizAssignmentId: assignment.id,
          answers: questions.map((question) => ({
            questionId: question.id,
            studentAnswer: answersRef.current[question.id] || "",
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Submission failed");
      setResult(data);
      submittedRef.current = true;
      setSubmitted(true);
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [assignment]);

  useEffect(() => {
    if (loading || submitted || locked || !assignment) return;
    const remaining = new Date(assignment.endTime).getTime() - Date.now();
    if (remaining <= 0) {
      void handleSubmit();
      return;
    }
    const timer = setTimeout(() => {
      toast.info("Time’s up — submitting your quiz.");
      void handleSubmit();
    }, remaining);
    return () => clearTimeout(timer);
  }, [loading, submitted, locked, assignment, handleSubmit]);

  useEffect(() => {
    if (loading || submitted || locked) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void lockQuiz();
    };
    const onBlur = () => void lockQuiz();
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [loading, submitted, locked, lockQuiz]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: answer }));
  };

  if (loading) {
    return (
      <div className="quiz-focus-page flex min-h-[75vh] items-center justify-center p-5">
        <div className="text-center"><div className="quiz-loader mx-auto mb-5 h-14 w-14 rounded-2xl border border-brand/20 bg-brand/10 p-3"><span className="block h-full w-full animate-spin rounded-full border-2 border-brand border-t-transparent" /></div><p className="text-sm font-semibold text-ink-muted">Preparing your quiz…</p></div>
      </div>
    );
  }

  if (!assignment) return null;

  const questions = assignment.quiz.questions;
  const progress = questions.length ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const remainingMs = Math.max(0, new Date(assignment.endTime).getTime() - clock);
  const remainingMinutes = Math.floor(remainingMs / 60000);
  const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

  if (locked) {
    return (
      <div className="quiz-focus-page flex min-h-[75vh] items-center justify-center p-5">
        <div className="result-panel w-full max-w-lg rounded-[28px] border border-line/75 bg-surface p-7 text-center shadow-2xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg></div>
          <span className="mt-5 inline-flex rounded-full bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-500">Attempt secured</span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-ink">Quiz locked</h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">The quiz window lost focus, so your current answers were submitted automatically to protect academic integrity.</p>
          <div className="mt-5 rounded-2xl border border-rose-500/15 bg-rose-500/5 p-4 text-xs leading-5 text-rose-600 dark:text-rose-300">Contact your teacher if you believe this happened by mistake.</div>
          <button type="button" onClick={() => router.push("/list/my-quizzes")} className="landing-button-secondary mt-7 w-full gap-2 px-5 py-3"><ArrowIcon back />Back to my quizzes</button>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    const percentage = result.percentage;
    const grade = percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "F";
    return (
      <div className="quiz-focus-page flex min-h-[75vh] items-center justify-center p-5">
        <div className="result-panel relative w-full max-w-xl overflow-hidden rounded-[30px] border border-line/75 bg-surface p-7 text-center shadow-2xl sm:p-10">
          <span className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-brand/15 blur-3xl" />
          <div className="relative">
            <span className="dashboard-section-kicker">Assessment complete</span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] text-ink">Quiz submitted</h2>
            <p className="mt-2 text-sm text-ink-muted">{assignment.quiz.title}</p>
            <div className="score-ring mx-auto mt-7 flex h-40 w-40 items-center justify-center rounded-full p-3" style={{ background: `conic-gradient(rgb(var(--brand)) ${percentage * 3.6}deg, rgb(var(--surface-subtle)) 0deg)` }}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface"><span className="text-4xl font-bold tracking-tight text-ink">{percentage}%</span><span className="mt-1 text-xs font-bold text-brand">Grade {grade}</span></div>
            </div>
            <p className="mx-auto mt-6 max-w-sm text-sm leading-6 text-ink-muted">You answered <strong className="text-ink">{result.score}</strong> out of <strong className="text-ink">{result.totalMarks}</strong> questions correctly.</p>
            <button type="button" onClick={() => router.push("/list/my-quizzes")} className="btn-primary mt-7 w-full gap-2 py-3"><ArrowIcon back />Back to my quizzes</button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  if (!question) return null;

  const difficultyClass = question.difficulty === "easy" ? "quiz-difficulty-easy" : question.difficulty === "hard" ? "quiz-difficulty-hard" : "quiz-difficulty-medium";

  return (
    <div className="quiz-focus-page min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-xs leading-5 text-amber-800 dark:text-amber-200">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15"><ShieldIcon /></span>
          <span><strong className="block font-bold">Focus mode is active</strong>Switching tabs, minimizing, or leaving this window will lock and submit your quiz.</span>
        </div>

        <header className="quiz-take-header relative overflow-hidden rounded-[24px] border border-line/75 bg-surface p-5 shadow-soft sm:p-6">
          <span className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div><span className="dashboard-section-kicker">Live assessment</span><h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink">{assignment.quiz.title}</h1><p className="mt-1.5 text-xs font-medium text-ink-muted">{assignment.quiz.teacher.name} {assignment.quiz.teacher.surname} · {assignment.class.name}</p></div>
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-muted/70 px-3 py-2 text-xs font-bold text-ink"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />{remainingMinutes}:{remainingSeconds.toString().padStart(2, "0")} remaining</div>
          </div>
          <div className="relative mt-6">
            <div className="mb-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-ink-subtle"><span>{Object.keys(answers).length} of {questions.length} answered</span><span>Question {currentQ + 1}/{questions.length}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-subtle"><div className="quiz-progress h-full rounded-full bg-gradient-to-r from-brand to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <section className="question-card rounded-[24px] border border-line/75 bg-surface p-5 shadow-soft sm:p-7">
            <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-xs font-bold text-brand">{currentQ + 1}</span><span className={`quiz-difficulty ${difficultyClass}`}>{question.difficulty}</span></div>{answers[question.id] && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Answered</span>}</div>
            <h2 className="mt-6 text-lg font-bold leading-8 tracking-[-0.02em] text-ink sm:text-xl">{question.question}</h2>
            <div className="mt-7 space-y-3">
              {question.options.map((option, index) => {
                const label = String.fromCharCode(65 + index);
                const selected = answers[question.id] === option;
                return (
                  <button type="button" key={option} onClick={() => handleAnswer(question.id, option)} className={`quiz-option group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all ${selected ? "is-selected border-brand/50 bg-brand/8 text-ink shadow-sm" : "border-line/80 bg-surface-muted/35 text-ink-muted hover:-translate-y-0.5 hover:border-brand/25 hover:bg-surface"}`}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition ${selected ? "bg-brand text-white shadow-md shadow-brand/20" : "border border-line bg-surface text-ink-subtle group-hover:text-brand"}`}>{label}</span><span className="text-sm font-semibold leading-6">{option}</span>{selected && <span className="ml-auto text-brand"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4"><path d="m5 12 4 4L19 6" /></svg></span>}
                  </button>
                );
              })}
            </div>
            <div className="mt-7 flex gap-3 border-t border-line/70 pt-5">
              <button type="button" onClick={() => setCurrentQ((index) => Math.max(0, index - 1))} disabled={currentQ === 0} className="landing-button-secondary flex-1 gap-2 px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"><ArrowIcon back />Previous</button>
              {currentQ < questions.length - 1 ? (
                <button type="button" onClick={() => setCurrentQ((index) => index + 1)} className="btn-primary flex-1 gap-2 py-2.5">Next<ArrowIcon /></button>
              ) : (
                <button type="button" onClick={() => void handleSubmit()} disabled={submitting} className="btn-primary flex-1 gap-2 py-2.5 disabled:opacity-50">{submitting ? "Submitting…" : "Submit quiz"}<ArrowIcon /></button>
              )}
            </div>
          </section>

          <aside className="question-map h-fit rounded-[22px] border border-line/75 bg-surface p-4 shadow-soft lg:sticky lg:top-24">
            <div className="flex items-center justify-between"><div><span className="dashboard-section-kicker">Navigate</span><h3 className="mt-1 text-sm font-bold text-ink">Question map</h3></div><span className="text-[10px] font-bold text-ink-subtle">{Math.round(progress)}%</span></div>
            <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
              {questions.map((item, index) => <button type="button" key={item.id} onClick={() => setCurrentQ(index)} aria-label={`Go to question ${index + 1}`} className={`flex aspect-square items-center justify-center rounded-xl text-[11px] font-bold transition ${index === currentQ ? "scale-105 bg-brand text-white shadow-md shadow-brand/20" : answers[item.id] ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300" : "border border-line bg-surface-muted text-ink-subtle hover:border-brand/25"}`}>{index + 1}</button>)}
            </div>
            <div className="mt-5 space-y-2 border-t border-line/70 pt-4 text-[10px] font-medium text-ink-subtle"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-brand" />Current</div><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded bg-emerald-500/40" />Answered</div></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
