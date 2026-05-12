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
  const [dueDate, setDueDate] = useState("");
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
    if (!dueDate) { toast.error("Please set a due date."); return; }
    setAssigning(true);
    try {
      const result = await assignQuizToClass(savedQuizId, Number(selectedClassId), new Date(dueDate), schoolId);
      if (result.success) {
        toast.success("Quiz assigned to class!");
        setStep(0);
        setQuiz([]);
        setFile(null);
        setQuizTitle("");
        setSavedQuizId(null);
        setSelectedClassId("");
        setDueDate("");
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
    <div className="panel overflow-hidden">
      {/* Step Header */}
      <div className="px-6 py-5 border-b border-line bg-surface-subtle">
        <h2 className="text-ink text-lg font-semibold mb-4">AI Quiz Generator</h2>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all border
                  ${
                    step === i
                      ? "bg-brand text-white border-transparent shadow-sm scale-110"
                      : step > i
                      ? "bg-brand-soft text-brand border-transparent"
                      : "bg-surface text-ink-subtle border-line"
                  }`}
              >
                {step > i ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  step === i ? "text-ink" : "text-ink-subtle"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-line mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* STEP 0 */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="border-2 border-dashed border-line rounded-xl p-5 text-center hover:border-brand transition-colors bg-surface-subtle">
              <input
                type="file"
                id="quizFile"
                accept=".pdf,.docx,.pptx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <label htmlFor="quizFile" className="cursor-pointer block">
                <div className="mx-auto w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center mb-3 text-ink-muted">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                {file ? (
                  <p className="text-ink font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-ink font-medium">Click to upload or drag &amp; drop</p>
                    <p className="text-ink-subtle text-sm mt-1">PDF, DOCX, PPTX, TXT</p>
                  </>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating…" : "Generate MCQs"}
            </button>

            {showProgress && (
              <div className="w-full bg-surface-subtle rounded-full h-2 overflow-hidden">
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
                    <div key={i} className="bg-surface-subtle border border-line rounded-xl p-4">
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
          <div className="space-y-5">
            <div className="bg-brand-soft border border-line rounded-xl p-4 text-sm text-ink">
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
          <div className="space-y-5">
            <div className="bg-brand-soft border border-line rounded-xl p-4 text-sm text-ink">
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
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">Due Date</label>
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="input-base"
                  />
                </div>
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
