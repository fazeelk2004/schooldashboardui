"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { markAttendance } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Student = { id: string; name: string; surname: string };
type Lesson = {
  id: number;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  class: { name: string };
};

type LessonStatus = "before" | "active" | "after" | "wrong-day";

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const lessonTimeOfDaySeconds = (iso: string) => {
  const d = new Date(iso);
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
};

const getLessonStatus = (
  lesson: Lesson,
  todayDayName: string,
  nowSeconds: number
): LessonStatus => {
  if (lesson.day !== todayDayName) return "wrong-day";
  const start = lessonTimeOfDaySeconds(lesson.startTime);
  const end = lessonTimeOfDaySeconds(lesson.endTime);
  if (nowSeconds < start) return "before";
  if (nowSeconds > end) return "after";
  return "active";
};

const AttendanceMarker = ({
  lessons,
  studentsByLesson,
  existingAttendance,
  today,
  todayDayName,
}: {
  lessons: Lesson[];
  studentsByLesson: Record<number, Student[]>;
  existingAttendance: Record<string, boolean>;
  today: string;
  todayDayName: string;
}) => {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());

  // Tick every 30s so the lesson window status updates live.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(() => {
    const active = lessons.find(
      (l) => getLessonStatus(l, todayDayName, nowSeconds) === "active"
    );
    return active?.id ?? lessons[0]?.id ?? null;
  });
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );

  const status: LessonStatus | null = selectedLesson
    ? getLessonStatus(selectedLesson, todayDayName, nowSeconds)
    : null;

  const students = selectedLessonId ? studentsByLesson[selectedLessonId] || [] : [];

  useEffect(() => {
    if (!selectedLessonId) return;
    const list = studentsByLesson[selectedLessonId] || [];
    const init: Record<string, boolean> = {};
    list.forEach((s) => {
      const key = `${s.id}-${selectedLessonId}-${today}`;
      init[s.id] = existingAttendance[key] ?? true;
    });
    setAttendance(init);
  }, [selectedLessonId, studentsByLesson, existingAttendance, today]);

  const canEdit = status === "active";

  const toggleAll = (value: boolean) => {
    if (!canEdit) return;
    const updated: Record<string, boolean> = {};
    students.forEach((s) => (updated[s.id] = value));
    setAttendance(updated);
  };

  const handleSubmit = () => {
    if (!selectedLessonId || !canEdit) return;
    const records = students.map((s) => ({
      studentId: s.id,
      lessonId: selectedLessonId,
      date: today,
      present: attendance[s.id] ?? true,
    }));

    startTransition(async () => {
      const result = await markAttendance(records);
      if (result.success) {
        toast.success("Attendance saved");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save attendance");
      }
    });
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="panel p-5 flex flex-wrap gap-5 items-end">
        <div className="flex flex-col gap-1.5 min-w-[260px]">
          <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
            Lesson
          </label>
          <select
            className="input-base"
            value={selectedLessonId ?? ""}
            onChange={(e) => setSelectedLessonId(Number(e.target.value))}
          >
            {lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} — {lesson.class.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
            Date
          </label>
          <div className="border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink-muted bg-surface-subtle min-w-[160px]">
            {(() => {
              const [y, m, d] = today.split("-").map(Number);
              return new Date(y, m - 1, d).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            })()}
          </div>
        </div>

        {selectedLesson && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
              Lesson window
            </label>
            <div className="text-sm text-ink-muted px-3.5 py-2.5 bg-surface-subtle border border-line rounded-lg">
              {fmtTime(selectedLesson.startTime)} – {fmtTime(selectedLesson.endTime)}
            </div>
          </div>
        )}

        {status && <StatusBadge status={status} />}
      </div>

      {/* Status banner */}
      {status && status !== "active" && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            {status === "before" && "This lesson hasn't started yet — attendance can be marked once it begins."}
            {status === "after" && "This lesson has ended — attendance can no longer be changed."}
            {status === "wrong-day" && "This lesson is not scheduled for today."}
          </span>
        </div>
      )}

      {/* Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Present" value={presentCount} tone="green" />
          <StatCard label="Absent" value={absentCount} tone="red" />
          <StatCard label="Total" value={students.length} tone="neutral" />
        </div>
      )}

      {/* Action row */}
      {students.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleAll(true)}
            disabled={!canEdit}
            className="px-3.5 py-2 text-xs font-medium text-ink-muted bg-surface border border-line rounded-lg hover:bg-surface-subtle transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark all present
          </button>
          <button
            onClick={() => toggleAll(false)}
            disabled={!canEdit}
            className="px-3.5 py-2 text-xs font-medium text-ink-muted bg-surface border border-line rounded-lg hover:bg-surface-subtle transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark all absent
          </button>
        </div>
      )}

      {/* Student List */}
      <div className="panel overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center text-ink-subtle text-sm">
            No students found for this lesson.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider w-12">
                  #
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                  Student
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {students.map((student, idx) => {
                const isPresent = attendance[student.id] ?? true;
                return (
                  <tr key={student.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-5 py-3.5 text-sm text-ink-subtle">{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-subtle text-ink-muted flex items-center justify-center text-xs font-semibold">
                          {student.name[0]}
                          {student.surname[0]}
                        </div>
                        <span className="text-sm font-medium text-ink">
                          {student.name} {student.surname}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <Toggle
                          value={isPresent}
                          disabled={!canEdit}
                          onChange={(v) =>
                            setAttendance((prev) => ({ ...prev, [student.id]: v }))
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Submit */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isPending || !canEdit}
            className="btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : "Save attendance"}
          </button>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: LessonStatus }) => {
  const map: Record<LessonStatus, { label: string; className: string; dot: string }> = {
    active: {
      label: "In session",
      className: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/40",
      dot: "bg-green-500",
    },
    before: {
      label: "Not started",
      className: "bg-surface-subtle text-ink-muted border-line",
      dot: "bg-ink-subtle",
    },
    after: {
      label: "Ended",
      className: "bg-surface-subtle text-ink-subtle border-line",
      dot: "bg-ink-subtle",
    },
    "wrong-day": {
      label: "Not today",
      className: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/40",
      dot: "bg-amber-500",
    },
  };
  const { label, className, dot } = map[status];
  return (
    <div className="flex flex-col gap-1.5 ml-auto">
      <label className="text-[11px] font-medium text-ink-subtle uppercase tracking-wider">
        Status
      </label>
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-medium ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === "active" ? "animate-pulse" : ""}`} />
        {label}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "neutral";
}) => {
  const toneClasses = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-500 dark:text-red-400",
    neutral: "text-ink",
  }[tone];
  return (
    <div className="panel px-5 py-4">
      <div className={`text-2xl font-semibold ${toneClasses}`}>{value}</div>
      <div className="text-[11px] text-ink-subtle font-medium uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
};

const Toggle = ({
  value,
  onChange,
  disabled,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="inline-flex bg-surface-subtle rounded-full p-0.5 text-xs font-medium">
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(true)}
      className={`px-3 py-1 rounded-full transition ${
        value ? "bg-surface text-green-600 dark:text-green-400 shadow-sm" : "text-ink-subtle"
      } disabled:cursor-not-allowed`}
    >
      Present
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(false)}
      className={`px-3 py-1 rounded-full transition ${
        !value ? "bg-surface text-red-500 dark:text-red-400 shadow-sm" : "text-ink-subtle"
      } disabled:cursor-not-allowed`}
    >
      Absent
    </button>
  </div>
);

export default AttendanceMarker;
