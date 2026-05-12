"use client";

import { useState, useMemo } from "react";
import { assignQuizToClass } from "@/lib/actions";
import { toast } from "react-toastify";

type SavedQuiz = {
  id: number;
  title: string;
  createdAt: string | Date;
  _count: { questions: number; quizAssignments: number };
  quizAssignments: { classId: number }[];
};

type Props = {
  schoolId: number;
  classes: { id: number; name: string }[];
  quizzes: SavedQuiz[];
};

export default function SavedQuizzesList({ schoolId, classes, quizzes }: Props) {
  const [openQuizId, setOpenQuizId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | "">("");
  const [quizDate, setQuizDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assigning, setAssigning] = useState(false);

  const activeQuiz = useMemo(
    () => quizzes.find((q) => q.id === openQuizId) ?? null,
    [openQuizId, quizzes]
  );

  const assignedClassIds = useMemo(
    () => new Set(activeQuiz?.quizAssignments.map((a) => a.classId) ?? []),
    [activeQuiz]
  );

  const isAlreadyAssigned =
    selectedClassId !== "" && assignedClassIds.has(Number(selectedClassId));

  const closeModal = () => {
    setOpenQuizId(null);
    setSelectedClassId("");
    setQuizDate("");
    setStartTime("");
    setEndTime("");
  };

  const handleAssign = async () => {
    if (!activeQuiz) return;
    if (!selectedClassId) { toast.error("Please select a class."); return; }
    if (isAlreadyAssigned) { toast.error("This class has already been assigned this quiz."); return; }
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
      const result = await assignQuizToClass(
        activeQuiz.id,
        Number(selectedClassId),
        start,
        end,
        schoolId
      );
      if (result.success) {
        toast.success("Quiz assigned to class!");
        closeModal();
      } else {
        toast.error("Failed to assign quiz.");
      }
    } finally {
      setAssigning(false);
    }
  };

  return (
    <>
      <div className="panel overflow-hidden">
        <div className="px-6 py-5 border-b border-line">
          <h2 className="text-lg font-semibold text-ink">My Saved Quizzes</h2>
          <p className="text-sm text-ink-subtle mt-0.5">Quizzes you&apos;ve generated and saved</p>
        </div>
        <div className="divide-y divide-line">
          {quizzes.length === 0 ? (
            <div className="px-6 py-12 text-center text-ink-subtle">
              <div className="mx-auto w-10 h-10 rounded-full bg-surface-subtle border border-line flex items-center justify-center mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>
              </div>
              <p className="text-sm">No quizzes yet. Generate one on the left.</p>
            </div>
          ) : (
            quizzes.map((q) => (
              <div key={q.id} className="px-6 py-4 hover:bg-surface-subtle transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink truncate">{q.title}</p>
                    <p className="text-xs text-ink-subtle mt-0.5">
                      {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(q.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    <span className="chip">{q._count.questions} Qs</span>
                    <span className="chip">{q._count.quizAssignments} assigned</span>
                    <button
                      onClick={() => {
                        setOpenQuizId(q.id);
                        setSelectedClassId("");
                        setQuizDate("");
                        setStartTime("");
                        setEndTime("");
                      }}
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {activeQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="panel w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-line">
              <h3 className="text-lg font-semibold text-ink">Assign Quiz</h3>
              <p className="text-sm text-ink-subtle mt-0.5 truncate">{activeQuiz.title}</p>
            </div>
            <div className="p-6 space-y-5">
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
                      {classes.map((c) => {
                        const already = assignedClassIds.has(c.id);
                        return (
                          <option key={c.id} value={c.id}>
                            {c.name}{already ? " (already assigned)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    {isAlreadyAssigned && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                        This Class Has Already Been Assigned This Quiz
                      </p>
                    )}
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
                </>
              )}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="btn-ghost flex-1 border border-line py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || classes.length === 0 || isAlreadyAssigned}
                  className="btn-primary flex-1 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assigning ? "Assigning…" : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
