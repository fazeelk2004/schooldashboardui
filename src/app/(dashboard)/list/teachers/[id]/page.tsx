import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: { select: { subjects: true, lessons: true, classes: true } },
    },
  });

  if (!teacher) return notFound();

  const initials =
    (teacher.name?.[0] ?? "") + (teacher.surname?.[0] ?? "");

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        {/* TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IDENTITY CARD */}
          <div className="panel panel-pad lg:col-span-2 flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0">
              {teacher.img ? (
                <Image
                  src={teacher.img}
                  alt=""
                  width={112}
                  height={112}
                  className="w-28 h-28 rounded-2xl object-cover ring-1 ring-line"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-brand-soft text-brand flex items-center justify-center text-2xl font-semibold ring-1 ring-line">
                  {initials.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip mb-2">Teacher</span>
                  <h1 className="text-2xl font-semibold tracking-tight text-ink truncate">
                    {teacher.name} {teacher.surname}
                  </h1>
                  <p className="text-sm text-ink-subtle mt-0.5">
                    {teacher._count.subjects} subject{teacher._count.subjects !== 1 ? "s" : ""} · {teacher._count.classes} class{teacher._count.classes !== 1 ? "es" : ""}
                  </p>
                </div>
                {role === "admin" && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm mt-2">
                <InfoRow icon="blood" label="Blood" value={teacher.bloodType || "—"} />
                <InfoRow
                  icon="date"
                  label="Birthday"
                  value={new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
                />
                <InfoRow icon="mail" label="Email" value={teacher.email || "—"} />
                <InfoRow icon="phone" label="Phone" value={teacher.phone || "—"} />
              </div>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-1">
            <StatTile
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              }
              label="Attendance"
              value="90%"
            />
            <StatTile
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              }
              label="Subjects"
              value={teacher._count.subjects}
            />
            <StatTile
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              }
              label="Lessons"
              value={teacher._count.lessons}
            />
            <StatTile
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              }
              label="Classes"
              value={teacher._count.classes}
            />
          </div>
        </div>

        {/* SCHEDULE */}
        <div className="panel panel-pad">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-ink">Schedule</h2>
            <span className="text-xs text-ink-subtle">This week</span>
          </div>
          <div className="h-[720px]">
            <BigCalendarContainer type="teacherId" id={teacher.id} />
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="panel panel-pad">
          <h2 className="text-base font-semibold text-ink">Shortcuts</h2>
          <p className="text-xs text-ink-subtle mt-0.5">Quick links related to this teacher.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Shortcut href={`/list/classes?supervisorId=${teacher.id}`} label="Classes" />
            <Shortcut href={`/list/students?teacherId=${teacher.id}`} label="Students" />
            <Shortcut href={`/list/lessons?teacherId=${teacher.id}`} label="Lessons" />
            <Shortcut href={`/list/exams?teacherId=${teacher.id}`} label="Exams" />
            <Shortcut href={`/list/assignments?teacherId=${teacher.id}`} label="Assignments" />
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: "blood" | "date" | "mail" | "phone";
  label: string;
  value: string;
}) => {
  const iconMap = {
    blood: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
    ),
    date: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    ),
    mail: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    phone: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
  };
  return (
    <div className="flex items-center gap-2 text-sm min-w-0">
      <span className="text-ink-subtle flex-shrink-0">{iconMap[icon]}</span>
      <span className="text-ink-subtle text-xs">{label}:</span>
      <span className="text-ink truncate">{value}</span>
    </div>
  );
};

const StatTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="panel p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] uppercase tracking-wider font-medium text-ink-subtle">
        {label}
      </span>
      <span className="text-ink-subtle">{icon}</span>
    </div>
    <span className="text-2xl font-semibold text-ink leading-none">{value}</span>
  </div>
);

const Shortcut = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="rounded-xl border border-line bg-surface-subtle px-3 py-2.5 text-xs font-medium text-ink-muted hover:bg-brand-soft hover:text-brand hover:border-transparent transition"
  >
    {label}
  </Link>
);

export default SingleTeacherPage;
