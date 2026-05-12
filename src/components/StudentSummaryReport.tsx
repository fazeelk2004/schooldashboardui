"use client";

import { useEffect, useState } from "react";

type ReportData = {
  student: {
    id: string;
    name: string;
    surname: string;
    username: string;
    img: string | null;
    className?: string;
    gradeLevel?: number;
    schoolName?: string;
  };
  period: { start: string; end: string; label: string };
  attendance: {
    total: number;
    present: number;
    absent: number;
    percentage: number | null;
    bySubject: {
      subject: string;
      total: number;
      present: number;
      absent: number;
      percentage: number;
    }[];
    entries: {
      id: number;
      date: string;
      present: boolean;
      lesson: string;
      subject: string;
    }[];
  };
  academics: {
    avgScore: number | null;
    totalResults: number;
    examCount: number;
    assignmentCount: number;
    entries: {
      id: number;
      score: number;
      type: string;
      title: string;
      subject: string;
      date: string | null;
    }[];
  };
  quizzes: {
    count: number;
    averagePercentage: number | null;
    entries: {
      id: number;
      title: string;
      score: number;
      totalMarks: number;
      percentage: number;
      submittedAt: string;
    }[];
  };
  announcements: {
    id: number;
    title: string;
    description: string;
    date: string;
  }[];
};

type Variant = "icon" | "inline";

const fmtDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "—";

const StudentSummaryReport = ({
  studentId,
  studentName,
  variant = "icon",
}: {
  studentId: string;
  studentName?: string;
  variant?: Variant;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    if (!open || data) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/student/${studentId}/summary`, {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load report");
        }
        const json = (await res.json()) as ReportData;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, studentId, data]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          aria-label="Summary report"
          title="Summary report"
          onClick={() => setOpen(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-soft text-brand hover:bg-brand/20 transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="14" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
            <line x1="10" y1="9" x2="11" y2="9" />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-soft hover:opacity-90 transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="14" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
          </svg>
          Summary Report
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:static print:bg-transparent print:p-0 print:backdrop-blur-none"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full overflow-y-auto rounded-2xl border border-line bg-surface shadow-card md:w-[85%] lg:w-[75%] xl:w-[65%] print:max-h-none print:w-full print:shadow-none print:border-0 print:rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-subtle hover:text-ink transition print:hidden"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="p-6 md:p-8 flex flex-col gap-6">
              {loading && (
                <div className="py-16 flex items-center justify-center text-sm text-ink-subtle">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                    Generating report…
                  </span>
                </div>
              )}

              {error && !loading && (
                <div className="py-16 text-center text-sm text-rose-500">
                  {error}
                </div>
              )}

              {!loading && !error && data && (
                <ReportBody data={data} onPrint={handlePrint} />
              )}

              {!data && !loading && !error && (
                <div className="py-16 text-center text-sm text-ink-subtle">
                  No data available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ReportBody = ({
  data,
  onPrint,
}: {
  data: ReportData;
  onPrint: () => void;
}) => {
  const { student, period, attendance, academics, quizzes, announcements } = data;
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-line">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-soft text-brand flex items-center justify-center text-lg font-semibold ring-1 ring-line flex-shrink-0">
            {(student.name?.[0] ?? "") + (student.surname?.[0] ?? "")}
          </div>
          <div className="min-w-0">
            <span className="chip mb-1.5">Summary Report</span>
            <h2 className="text-xl font-semibold text-ink tracking-tight">
              {student.name} {student.surname}
            </h2>
            <p className="text-xs text-ink-subtle mt-0.5">
              {student.className ?? "—"}
              {student.gradeLevel ? ` · Grade ${student.gradeLevel}` : ""}
              {student.schoolName ? ` · ${student.schoolName}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-2">
          <span className="text-[11px] uppercase tracking-wider font-medium text-ink-subtle">
            Period
          </span>
          <span className="text-sm font-semibold text-ink">{period.label}</span>
          <button
            onClick={onPrint}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-subtle transition print:hidden"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="Attendance"
          value={
            attendance.percentage !== null ? `${attendance.percentage}%` : "—"
          }
          sub={`${attendance.present}/${attendance.total} days`}
          tone={
            attendance.percentage === null
              ? "neutral"
              : attendance.percentage >= 85
              ? "green"
              : attendance.percentage >= 60
              ? "amber"
              : "red"
          }
        />
        <Kpi
          label="Avg. Score"
          value={academics.avgScore !== null ? `${academics.avgScore}` : "—"}
          sub={`${academics.totalResults} results`}
          tone={
            academics.avgScore === null
              ? "neutral"
              : academics.avgScore >= 75
              ? "green"
              : academics.avgScore >= 50
              ? "amber"
              : "red"
          }
        />
        <Kpi
          label="Quizzes"
          value={
            quizzes.averagePercentage !== null
              ? `${quizzes.averagePercentage}%`
              : "—"
          }
          sub={`${quizzes.count} taken`}
          tone={
            quizzes.averagePercentage === null
              ? "neutral"
              : quizzes.averagePercentage >= 75
              ? "green"
              : quizzes.averagePercentage >= 50
              ? "amber"
              : "red"
          }
        />
        <Kpi
          label="Absences"
          value={String(attendance.absent)}
          sub={`of ${attendance.total} sessions`}
          tone={
            attendance.absent === 0
              ? "green"
              : attendance.absent <= 2
              ? "amber"
              : "red"
          }
        />
      </div>

      {/* Attendance by subject */}
      <Section
        title="Attendance by Subject"
        empty={attendance.bySubject.length === 0}
        emptyText="No attendance recorded this month."
      >
        <div className="grid gap-2.5">
          {attendance.bySubject.map((s) => (
            <div
              key={s.subject}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface-subtle px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink truncate">
                    {s.subject}
                  </span>
                  <span className="text-xs font-semibold text-ink-muted whitespace-nowrap">
                    {s.percentage}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-surface overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.percentage >= 85
                        ? "bg-emerald-500"
                        : s.percentage >= 60
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
                <div className="mt-1.5 text-[11px] text-ink-subtle">
                  {s.present} present · {s.absent} absent
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Academic Results */}
      <Section
        title="Academic Results"
        subtitle={`${academics.examCount} exam${academics.examCount === 1 ? "" : "s"} · ${academics.assignmentCount} assignment${academics.assignmentCount === 1 ? "" : "s"}`}
        empty={academics.entries.length === 0}
        emptyText="No graded work this month."
      >
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full">
            <thead className="bg-surface-subtle">
              <tr>
                <Th>Title</Th>
                <Th className="hidden sm:table-cell">Subject</Th>
                <Th className="hidden md:table-cell">Type</Th>
                <Th className="hidden md:table-cell">Date</Th>
                <Th className="text-right">Score</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {academics.entries.map((r) => (
                <tr key={r.id} className="hover:bg-surface-subtle/60 transition">
                  <Td className="font-medium text-ink">{r.title}</Td>
                  <Td className="hidden sm:table-cell">{r.subject}</Td>
                  <Td className="hidden md:table-cell">
                    <span className="chip">{r.type}</span>
                  </Td>
                  <Td className="hidden md:table-cell">{fmtDate(r.date)}</Td>
                  <Td className="text-right font-semibold text-ink">
                    {r.score}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Quizzes */}
      <Section
        title="Quiz Performance"
        empty={quizzes.entries.length === 0}
        emptyText="No quizzes submitted this month."
      >
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full">
            <thead className="bg-surface-subtle">
              <tr>
                <Th>Quiz</Th>
                <Th className="hidden sm:table-cell">Submitted</Th>
                <Th className="text-right">Score</Th>
                <Th className="text-right">Percentage</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quizzes.entries.map((q) => (
                <tr key={q.id} className="hover:bg-surface-subtle/60 transition">
                  <Td className="font-medium text-ink">{q.title}</Td>
                  <Td className="hidden sm:table-cell">
                    {fmtDate(q.submittedAt)}
                  </Td>
                  <Td className="text-right">
                    {q.score}/{q.totalMarks}
                  </Td>
                  <Td className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        q.percentage >= 75
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : q.percentage >= 50
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      {q.percentage}%
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Recent attendance log */}
      <Section
        title="Daily Attendance Log"
        empty={attendance.entries.length === 0}
        emptyText="No attendance recorded this month."
      >
        <div className="overflow-hidden rounded-xl border border-line max-h-72 overflow-y-auto print:max-h-none">
          <table className="w-full">
            <thead className="bg-surface-subtle sticky top-0">
              <tr>
                <Th>Date</Th>
                <Th>Lesson</Th>
                <Th className="hidden sm:table-cell">Subject</Th>
                <Th className="text-right">Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {attendance.entries.map((a) => (
                <tr key={a.id} className="hover:bg-surface-subtle/60 transition">
                  <Td>{fmtDate(a.date)}</Td>
                  <Td className="text-ink">{a.lesson}</Td>
                  <Td className="hidden sm:table-cell">{a.subject}</Td>
                  <Td className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.present
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          a.present ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {a.present ? "Present" : "Absent"}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Announcements */}
      <Section
        title="Announcements"
        empty={announcements.length === 0}
        emptyText="No announcements posted this month."
      >
        <div className="grid gap-2.5">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-line bg-surface-subtle px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-ink">{a.title}</h4>
                <span className="text-[11px] text-ink-subtle whitespace-nowrap">
                  {fmtDate(a.date)}
                </span>
              </div>
              {a.description && (
                <p className="text-xs text-ink-muted mt-1 line-clamp-2">
                  {a.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <div className="pt-2 text-[11px] text-ink-subtle text-center">
        Generated {new Date().toLocaleString()}
      </div>
    </>
  );
};

const Kpi = ({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "green" | "amber" | "red" | "neutral";
}) => {
  const toneRing = {
    green: "ring-emerald-200 dark:ring-emerald-900/50",
    amber: "ring-amber-200 dark:ring-amber-900/50",
    red: "ring-rose-200 dark:ring-rose-900/50",
    neutral: "ring-line",
  }[tone];
  const toneText = {
    green: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    red: "text-rose-600 dark:text-rose-300",
    neutral: "text-ink",
  }[tone];
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-4 ring-1 ${toneRing}`}
    >
      <div className="text-[11px] uppercase tracking-wider font-medium text-ink-subtle">
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold leading-none ${toneText}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-ink-subtle">{sub}</div>
    </div>
  );
};

const Section = ({
  title,
  subtitle,
  empty,
  emptyText,
  children,
}: {
  title: string;
  subtitle?: string;
  empty?: boolean;
  emptyText?: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <div className="flex items-end justify-between gap-3">
      <h3 className="text-sm font-semibold text-ink tracking-tight">{title}</h3>
      {subtitle && (
        <span className="text-[11px] text-ink-subtle">{subtitle}</span>
      )}
    </div>
    {empty ? (
      <div className="rounded-xl border border-dashed border-line bg-surface-subtle/50 py-8 text-center text-xs text-ink-subtle">
        {emptyText ?? "No data."}
      </div>
    ) : (
      children
    )}
  </section>
);

const Th = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <th
    className={`px-4 py-2.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const Td = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-4 py-2.5 text-sm text-ink-muted ${className}`}>{children}</td>
);

export default StudentSummaryReport;
