"use client";

import { useState, useRef, useEffect } from "react";
import { saveQuiz, assignQuizToClass, type GeneratedQuestion } from "@/lib/actions";
import { toast } from "react-toastify";

type QuizQuestion = GeneratedQuestion & { id?: number };

type Props = {
  teacherId: string;
  schoolId: number;
  classes: { id: number; name: string }[];
};

const STEPS = ["Generate", "Save", "Assign"] as const;
type Step = 0 | 1 | 2;

export default function QuizGeneratorClient({ teacherId, schoolId, classes }: Props) {
  const [step, setStep] = useState<Step>(0);

  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [savedQuizId, setSavedQuizId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [quizDate, setQuizDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (progRef.current) { clearInterval(progRef.current); progRef.current = null; }
    if (loading) {
      setShowProgress(true);
      setProgress(0);
      progRef.current = setInterval(() => {
        setProgress((p) => (p >= 95 ? p : Math.min(95, p + Math.random() * 5 + 2)));
      }, 250);
    } else {
      setProgress(100);
      const t = setTimeout(() => { setShowProgress(false); setProgress(0); }, 400);
      return () => clearTimeout(t);
    }
    return () => { if (progRef.current) { clearInterval(progRef.current); progRef.current = null; } };
  }, [loading]);

  const generate = async () => {
    if (!file) { toast.error("Please upload a file."); return; }
    setLoading(true);
    setQuiz([]);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("questionCount", String(questionCount));
    formData.append("difficulty", difficulty);
    try {
      const res = await fetch("/api/generate-quiz", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setQuiz(data.quiz || []);
      if (data.quiz?.length) toast.success(`Generated ${data.quiz.length} questions!`);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!quizTitle.trim()) { toast.error("Please enter a quiz title."); return; }
    if (!quiz.length) { toast.error("No questions to save."); return; }
    setSaving(true);
    try {
      const result = await saveQuiz(teacherId, schoolId, quizTitle.trim(), quiz);
      if (result.success && result.quizId) {
        setSavedQuizId(result.quizId);
        toast.success("Quiz saved successfully!");
        setStep(2);
      } else {
        toast.error("Failed to save quiz.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!savedQuizId) { toast.error("No saved quiz."); return; }
    if (!selectedClassId) { toast.error("Please select a class."); return; }
    if (!quizDate) { toast.error("Please pick the quiz date."); return; }
    if (!startTime) { toast.error("Please set a start time."); return; }
    if (!endTime) { toast.error("Please set an end time."); return; }
    const start = new Date(`${quizDate}T${startTime}`);
    const end = new Date(`${quizDate}T${endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toast.error("Invalid date or time.");
      return;
    }
    if (end <= start) {
      toast.error("End time must be after start time.");
      return;
    }
    setAssigning(true);
    try {
      const result = await assignQuizToClass(savedQuizId, Number(selectedClassId), start, end, schoolId);
      if (result.success) {
        toast.success("Quiz assigned to class!");
        setStep(0);
        setQuiz([]);
        setFile(null);
        setQuizTitle("");
        setSavedQuizId(null);
        setSelectedClassId("");
        setQuizDate("");
        setStartTime("");
        setEndTime("");
      } else {
        toast.error("Failed to assign quiz.");
      }
    } finally {
      setAssigning(false);
    }
  };

  const difficultyColor = (d: string) =>
    d === "easy" ? "text-green-600 dark:text-green-400" : d === "hard" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400";

  return (
    <div className="quiz-builder dashboard-card overflow-hidden rounded-[24px] border border-line/75 bg-surface shadow-soft">
      {/* Step Header */}
      <div className="relative overflow-hidden border-b border-line/70 bg-gradient-to-br from-brand/10 via-surface to-violet-500/5 px-5 py-6 sm:px-7">
        <span className="dashboard-section-kicker">Build with Neura</span>
        <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink">AI Quiz Generator</h2>
        <p className="mt-1 text-xs text-ink-muted">Generate, review, save, and assign in three focused steps.</p>
        <div className="mt-5 flex items-center gap-1.5 sm:gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold transition-all
                  ${
                    step === i
                      ? "scale-105 border-transparent bg-brand text-white shadow-lg shadow-brand/20"
                      : step > i
                      ? "bg-brand-soft text-brand border-transparent"
                      : "bg-surface text-ink-subtle border-line"
                  }`}
              >
                {step > i ? "✓" : i + 1}
              </div>
              <span
                className={`hidden text-xs font-bold sm:inline ${
                  step === i ? "text-ink" : "text-ink-subtle"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="mx-1 h-px w-5 bg-line sm:w-8" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {/* STEP 0 */}
        {step === 0 && (
          <div className="space-y-6">
            <div className={`quiz-dropzone group relative overflow-hidden rounded-2xl border-2 border-dashed p-7 text-center transition-all ${file ? "border-brand/40 bg-brand/5" : "border-line bg-surface-muted/45 hover:border-brand/40 hover:bg-brand/5"}`}>
              <input
                type="file"
                id="quizFile"
                accept=".pdf,.docx,.pptx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <label htmlFor="quizFile" className="cursor-pointer block">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-brand shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                {file ? (
                  <p className="text-ink font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="font-bold text-ink">Choose your lesson material</p>
                    <p className="mt-1 text-xs text-ink-subtle">PDF, DOCX, PPTX, or TXT</p>
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-line/70 bg-surface-muted/35 p-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input-base"
                >
                  <option value="mixed">Mixed</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading || !file}
              className="btn-primary group w-full gap-2 py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating…" : "Generate MCQs"}
            </button>

            {showProgress && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle p-0.5">
                <div
                  className="h-full bg-brand transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {quiz.length > 0 && (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-ink">Preview ({quiz.length} questions)</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="btn-primary px-4 py-1.5 text-xs"
                  >
                    Save Quiz →
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {quiz.map((q, i) => (
                    <div key={i} className="question-preview rounded-2xl border border-line/70 bg-surface-muted/45 p-4 transition hover:border-brand/25 hover:bg-surface">
                      <p className="font-medium text-ink text-sm">
                        {i + 1}. {q.question}{" "}
                        <span className={`text-xs font-semibold italic ml-1 ${difficultyColor(q.difficulty)}`}>
                          [{q.difficulty}]
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1">
                        {q.options.map((opt, j) => (
                          <li
                            key={j}
                            className={`text-sm px-2 py-1 rounded-md ${
                              opt === q.answer
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium"
                                : "text-ink-muted"
                            }`}
                          >
                            {String.fromCharCode(65 + j)}. {opt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 p-4 text-sm font-medium text-ink">
              ✅ {quiz.length} questions generated. Give this quiz a title to save it.
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. Chapter 3 – Photosynthesis Quiz"
                className="input-base"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="btn-ghost flex-1 border border-line py-2.5"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 py-2.5 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Quiz"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 p-4 text-sm font-medium text-ink">
              ✅ Quiz &quot;<strong>{quizTitle}</strong>&quot; saved! Now assign it to a class.
            </div>
            {classes.length === 0 ? (
              <div className="border border-line rounded-xl p-4 text-sm text-ink-subtle bg-surface-subtle">
                You have no lessons in any class, so there are no classes to assign this quiz to.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">Assign to Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : "")}
                    className="input-base"
                  >
                    <option value="">Select a class…</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">Quiz Date</label>
                  <input
                    type="date"
                    value={quizDate}
                    onChange={(e) => setQuizDate(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="input-base"
                    />
                  </div>
                </div>
                <p className="text-xs text-ink-subtle">Students can only take the quiz between the start and end times on the selected date.</p>
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="btn-primary w-full py-3 disabled:opacity-50"
                >
                  {assigning ? "Assigning…" : "Assign to Class"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
