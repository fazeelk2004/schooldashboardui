"use client";

import { useState, useEffect } from "react";
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
  dueDate: string;
  quiz: {
    title: string;
    teacher: { name: string; surname: string };
    questions: Question[];
  };
  class: { name: string };
};

export default function QuizTakePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; totalMarks: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    fetch(`/api/quiz/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { toast.error(data.error); router.push("/list/my-quizzes"); return; }
        setAssignment(data);
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load quiz."); router.push("/list/my-quizzes"); });
  }, [params.id, router]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!assignment) return;
    const questions = assignment.quiz.questions;
    const answered = Object.keys(answers).length;
    if (answered < questions.length) {
      const unanswered = questions.length - answered;
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizAssignmentId: assignment.id,
          // studentId is retrieved server-side via auth
          answers: questions.map((q) => ({
            questionId: q.id,
            studentAnswer: answers[q.id] || "",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setResult(data);
      setSubmitted(true);
    } catch (err: unknown) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading quiz…</p>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  const questions = assignment.quiz.questions;
  const progress = (Object.keys(answers).length / questions.length) * 100;

  /* ── Result screen ── */
  if (submitted && result) {
    const pct = result.percentage;
    const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
    const gradeColor = pct >= 70 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600";

    return (
      <div className="p-4 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{pct >= 70 ? "🎉" : pct >= 50 ? "📚" : "💪"}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Quiz Submitted!</h2>
          <p className="text-gray-500 mb-6">{assignment.quiz.title}</p>
          <div className={`text-7xl font-black mb-2 ${gradeColor}`}>{pct}%</div>
          <div className={`text-2xl font-bold mb-4 ${gradeColor}`}>Grade: {grade}</div>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-gray-600 text-sm">
              You answered <strong className="text-gray-800">{result.score}</strong> out of{" "}
              <strong className="text-gray-800">{result.totalMarks}</strong> questions correctly.
            </p>
          </div>
          <button
            onClick={() => router.push("/list/my-quizzes")}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            ← Back to My Quizzes
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const difficultyColor = (d: string) =>
    d === "easy" ? "bg-green-100 text-green-700" : d === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-white font-bold text-lg">{assignment.quiz.title}</h1>
          <p className="text-indigo-200 text-sm">
            👤 {assignment.quiz.teacher.name} {assignment.quiz.teacher.surname} · 🏫 {assignment.class.name}
          </p>
        </div>
        {/* Progress */}
        <div className="px-6 py-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{Object.keys(answers).length} of {questions.length} answered</span>
            <span>Q {currentQ + 1}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Question {currentQ + 1}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(q.difficulty)}`}>
              {q.difficulty}
            </span>
          </div>
          {answers[q.id] && (
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">✓ Answered</span>
          )}
        </div>
        <p className="text-gray-800 font-semibold text-base leading-relaxed mb-6">{q.question}</p>
        <div className="space-y-3">
          {(q.options as string[]).map((option, idx) => {
            const label = String.fromCharCode(65 + idx);
            const isSelected = answers[q.id] === option;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(q.id, option)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
                  ${isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                    : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/30 text-gray-700"
                  }`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shrink-0
                  ${isSelected ? "bg-indigo-500 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>
                  {label}
                </span>
                <span className="text-sm">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-6 h-6 rounded-full text-xs font-medium transition-all
                ${i === currentQ ? "bg-indigo-600 text-white scale-110" : answers[questions[i].id] ? "bg-indigo-200 text-indigo-700" : "bg-gray-100 text-gray-500"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ((q) => q + 1)}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-md"
          >
            {submitting ? "Submitting…" : "✅ Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
}
