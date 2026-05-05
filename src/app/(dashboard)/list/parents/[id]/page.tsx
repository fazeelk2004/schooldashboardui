import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleParentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const parent = await prisma.parent.findUnique({
    where: { id },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          surname: true,
          img: true,
          class: { select: { name: true } },
        },
      },
      school: { select: { name: true } },
    },
  });

  if (!parent) return notFound();

  const initials =
    (parent.name?.[0] ?? "") + (parent.surname?.[0] ?? "");

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6">
        {/* IDENTITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="panel panel-pad lg:col-span-2 flex flex-col sm:flex-row gap-5">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-brand-soft text-brand flex items-center justify-center text-2xl font-semibold ring-1 ring-line">
                {initials.toUpperCase()}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="chip mb-2">Parent</span>
                  <h1 className="text-2xl font-semibold tracking-tight text-ink truncate">
                    {parent.name} {parent.surname}
                  </h1>
                  <p className="text-sm text-ink-subtle mt-0.5">
                    {parent.students.length} child
                    {parent.students.length !== 1 ? "ren" : ""}
                    {parent.school?.name ? ` · ${parent.school.name}` : ""}
                  </p>
                </div>
                {role === "admin" && (
                  <FormContainer table="parent" type="update" data={parent} />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm mt-2">
                <InfoRow icon="user" label="Username" value={parent.username} />
                <InfoRow icon="mail" label="Email" value={parent.email || "—"} />
                <InfoRow icon="phone" label="Phone" value={parent.phone} />
                <InfoRow icon="pin" label="Address" value={parent.address} />
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-3 lg:col-span-1">
            <StatTile
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              }
              label="Children"
              value={parent.students.length}
            />
            <StatTile
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v13"/><path d="M3 21h18"/></svg>
              }
              label="Classes"
              value={
                new Set(parent.students.map((s) => s.class?.name).filter(Boolean)).size
              }
            />
          </div>
        </div>

        {/* CHILDREN */}
        <div className="panel panel-pad">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-ink">Children</h2>
            <span className="text-xs text-ink-subtle">
              {parent.students.length} student
              {parent.students.length !== 1 ? "s" : ""}
            </span>
          </div>
          {parent.students.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-subtle">
              No students linked to this parent.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parent.students.map((s) => {
                const ci = (s.name?.[0] ?? "") + (s.surname?.[0] ?? "");
                return (
                  <Link
                    key={s.id}
                    href={`/list/students/${s.id}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface-subtle px-4 py-3 hover:bg-brand-soft hover:border-transparent transition group"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface text-ink-muted flex items-center justify-center text-xs font-semibold ring-1 ring-line group-hover:ring-transparent">
                      {ci.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-ink truncate">
                        {s.name} {s.surname}
                      </div>
                      <div className="text-xs text-ink-subtle truncate">
                        Class {s.class?.name ?? "—"}
                      </div>
                    </div>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-ink-subtle group-hover:text-brand"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className="panel panel-pad">
          <h2 className="text-base font-semibold text-ink">Shortcuts</h2>
          <p className="text-xs text-ink-subtle mt-0.5">
            Quick links related to this parent.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Shortcut
              href={`/list/students?parentId=${parent.id}`}
              label="Students"
            />
            {parent.students[0] && (
              <Shortcut
                href={`/list/results?studentId=${parent.students[0].id}`}
                label="Results"
              />
            )}
            {parent.students[0] && (
              <Shortcut
                href={`/list/attendance?studentId=${parent.students[0].id}`}
                label="Attendance"
              />
            )}
            <Shortcut href={`/list/announcements`} label="Announcements" />
          </div>
        </div>
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
  icon: "user" | "mail" | "phone" | "pin";
  label: string;
  value: string;
}) => {
  const iconMap = {
    user: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    mail: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    phone: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    ),
    pin: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
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

export default SingleParentPage;
