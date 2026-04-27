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
  // Step management
  const [step, setStep] = useState<Step>(0);

  // Step 1: Generate
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 2: Save
  const [quizTitle, setQuizTitle] = useState("");
  const [savedQuizId, setSavedQuizId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Step 3: Assign
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Progress bar effect
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

  /* ---- Step 1: Generate ---- */
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

  /* ---- Step 2: Save ---- */
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

  /* ---- Step 3: Assign ---- */
  const handleAssign = async () => {
    if (!savedQuizId) { toast.error("No saved quiz."); return; }
    if (!selectedClassId) { toast.error("Please select a class."); return; }
    if (!dueDate) { toast.error("Please set a due date."); return; }
    setAssigning(true);
    try {
      const result = await assignQuizToClass(savedQuizId, Number(selectedClassId), new Date(dueDate), schoolId);
      if (result.success) {
        toast.success("Quiz assigned to class!");
        // Reset for new quiz
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
    d === "easy" ? "text-green-600" : d === "hard" ? "text-red-600" : "text-yellow-600";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Step Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
        <h2 className="text-white text-xl font-bold mb-4">📘 AI Quiz Generator</h2>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all
                  ${step === i ? "bg-white text-blue-600 shadow-lg scale-110" : step > i ? "bg-blue-400 text-white" : "bg-blue-500/40 text-white/70"}`}
              >
                {step > i ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i ? "text-white" : "text-blue-200"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5 bg-blue-400/50 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* ─── STEP 0: GENERATE ─── */}
        {step === 0 && (
          <div className="space-y-5">
            {/* File Upload */}
            <div className="border-2 border-dashed border-blue-200 rounded-xl p-5 text-center hover:border-blue-400 transition-colors bg-blue-50/30">
              <input
                type="file"
                id="quizFile"
                accept=".pdf,.docx,.pptx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <label htmlFor="quizFile" className="cursor-pointer">
                <div className="text-3xl mb-2">📄</div>
                {file ? (
                  <p className="text-blue-700 font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-gray-600 font-medium">Click to upload or drag & drop</p>
                    <p className="text-gray-400 text-sm mt-1">PDF, DOCX, PPTX, TXT</p>
                  </>
                )}
              </label>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? "Generating…" : "⚡ Generate MCQs"}
            </button>

            {/* Progress bar */}
            {showProgress && (
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Preview */}
            {quiz.length > 0 && (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">Preview ({quiz.length} questions)</h3>
                  <button
                    onClick={() => setStep(1)}
                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    Save Quiz →
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {quiz.map((q, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="font-medium text-gray-800 text-sm">
                        {i + 1}. {q.question}{" "}
                        <span className={`text-xs font-semibold italic ml-1 ${difficultyColor(q.difficulty)}`}>
                          [{q.difficulty}]
                        </span>
                      </p>
                      <ul className="mt-2 space-y-1">
                        {q.options.map((opt, j) => (
                          <li key={j} className={`text-sm px-2 py-1 rounded-md ${opt === q.answer ? "bg-green-100 text-green-700 font-medium" : "text-gray-600"}`}>
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

        {/* ─── STEP 1: SAVE ─── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              ✅ {quiz.length} questions generated. Give this quiz a title to save it.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="e.g. Chapter 3 – Photosynthesis Quiz"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-md"
              >
                {saving ? "Saving…" : "💾 Save Quiz"}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: ASSIGN ─── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
              ✅ Quiz &quot;<strong>{quizTitle}</strong>&quot; saved! Now assign it to a class.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Assign to Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select a class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-md"
            >
              {assigning ? "Assigning…" : "🎯 Assign to Class"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
