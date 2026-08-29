"use client";

import { useMemo, useState } from "react";

type Record = {
  id: number;
  date: string;
  present: boolean;
  studentName: string;
  lessonName: string;
  className: string;
  subjectName: string;
  teacherName: string;
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const AttendanceViewer = ({
  records,
  role,
}: {
  records: Record[];
  role: string;
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "present" | "absent">("all");

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (filter === "present" && !r.present) return false;
      if (filter === "absent" && r.present) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.lessonName.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.subjectName.toLowerCase().includes(q)
      );
    });
  }, [records, query, filter]);

  const total = records.length;
  const presentCount = records.filter((r) => r.present).length;
  const absentCount = total - presentCount;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  const showStudentColumn = role !== "student";

  return (
    <div className="attendance-viewer flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Records" value={total} />
        <StatCard label="Present" value={presentCount} tone="green" />
        <StatCard label="Absent" value={absentCount} tone="red" />
        <StatCard label="Attendance" value={`${rate}%`} tone="neutral" />
      </div>

      {/* Filters */}
      <div className="dashboard-card flex flex-wrap items-center gap-3 rounded-[22px] border border-line/75 bg-surface p-4 shadow-soft">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student, lesson, class…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-base pl-9"
          />
        </div>
        <div className="inline-flex rounded-xl border border-line/70 bg-surface-muted p-1 text-xs font-semibold">
          {(["all", "present", "absent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg capitalize transition ${
                filter === f ? "bg-brand text-white shadow-sm" : "text-ink-subtle hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-card overflow-hidden rounded-[22px] border border-line/75 bg-surface shadow-soft">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-ink-subtle">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line/70 bg-surface-muted/65">
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                    Date
                  </th>
                  {showStudentColumn && (
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                      Student
                    </th>
                  )}
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                    Lesson
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider hidden md:table-cell">
                    Class
                  </th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider hidden lg:table-cell">
                    Teacher
                  </th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-ink-subtle uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-brand/[0.035] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-ink-muted whitespace-nowrap">
                      {fmtDate(r.date)}
                    </td>
                    {showStudentColumn && (
                      <td className="px-5 py-3.5 text-sm font-medium text-ink">
                        {r.studentName}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-sm text-ink-muted">
                      {r.lessonName}
                      <div className="text-xs text-ink-subtle">{r.subjectName}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted hidden md:table-cell">
                      {r.className}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-ink-muted hidden lg:table-cell">
                      {r.teacherName}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          r.present
                            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/40"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-100 dark:border-red-900/40"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            r.present ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {r.present ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "green" | "red" | "neutral";
}) => {
  const toneClasses = {
    green: "text-green-600 dark:text-green-400",
    red: "text-red-500 dark:text-red-400",
    neutral: "text-ink",
  }[tone];
  return (
    <div className="attendance-stat dashboard-card relative overflow-hidden rounded-2xl border border-line/75 bg-surface px-4 py-4 shadow-soft sm:px-5">
      <span className={`absolute inset-x-0 top-0 h-0.5 ${tone === "green" ? "bg-emerald-500" : tone === "red" ? "bg-rose-500" : "bg-brand"}`} />
      <div className={`text-2xl font-semibold ${toneClasses}`}>{value}</div>
      <div className="text-[11px] text-ink-subtle font-medium uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
};

export default AttendanceViewer;
