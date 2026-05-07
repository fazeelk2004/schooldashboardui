import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import Link from "next/link";

const LIMIT = 8;

const SearchPage = async ({
  searchParams,
}: {
  searchParams: { q?: string };
}) => {
  const q = (searchParams.q ?? "").trim();
  const { role, schoolId } = getCurrentUser();
  const schoolFilter = role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {};

  const empty = q.length === 0;

  const [students, teachers, classes, subjects, parents] = empty
    ? [[], [], [], [], []]
    : await Promise.all([
        prisma.student.findMany({
          where: {
            ...schoolFilter,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { surname: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          include: { class: { select: { name: true } } },
          take: LIMIT,
        }),
        prisma.teacher.findMany({
          where: {
            ...schoolFilter,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { surname: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
          take: LIMIT,
        }),
        prisma.class.findMany({
          where: {
            ...schoolFilter,
            name: { contains: q, mode: "insensitive" },
          },
          include: { grade: { select: { level: true } } },
          take: LIMIT,
        }),
        prisma.subject.findMany({
          where: {
            ...schoolFilter,
            name: { contains: q, mode: "insensitive" },
          },
          take: LIMIT,
        }),
        prisma.parent.findMany({
          where: {
            ...schoolFilter,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { surname: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          },
          take: LIMIT,
        }),
      ]);

  const totalResults =
    students.length + teachers.length + classes.length + subjects.length + parents.length;

  return (
    <div className="m-4 mt-0 flex-1 rounded-2xl border border-line bg-surface p-6 shadow-soft">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">
          Search results
          {q && <span className="text-ink-muted"> for &quot;{q}&quot;</span>}
        </h1>
        <p className="mt-1 text-xs text-ink-subtle">
          {empty
            ? "Type a query in the search bar above."
            : `${totalResults} result${totalResults === 1 ? "" : "s"} across students, teachers, classes, subjects, and parents.`}
        </p>
      </div>

      {empty ? null : totalResults === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-subtle">
          No matches found.
        </div>
      ) : (
        <div className="space-y-6">
          <ResultSection title="Students" emptyHidden count={students.length}>
            {students.map((s) => (
              <ResultRow
                key={s.id}
                href={`/list/students/${s.id}`}
                title={`${s.name} ${s.surname}`}
                subtitle={`@${s.username} · ${s.class.name}`}
              />
            ))}
          </ResultSection>

          <ResultSection title="Teachers" emptyHidden count={teachers.length}>
            {teachers.map((t) => (
              <ResultRow
                key={t.id}
                href={`/list/teachers/${t.id}`}
                title={`${t.name} ${t.surname}`}
                subtitle={`@${t.username}${t.email ? " · " + t.email : ""}`}
              />
            ))}
          </ResultSection>

          <ResultSection title="Classes" emptyHidden count={classes.length}>
            {classes.map((c) => (
              <ResultRow
                key={c.id}
                href={`/list/classes`}
                title={c.name}
                subtitle={`Grade ${c.grade.level} · capacity ${c.capacity}`}
              />
            ))}
          </ResultSection>

          <ResultSection title="Subjects" emptyHidden count={subjects.length}>
            {subjects.map((s) => (
              <ResultRow key={s.id} href={`/list/subjects`} title={s.name} subtitle="" />
            ))}
          </ResultSection>

          <ResultSection title="Parents" emptyHidden count={parents.length}>
            {parents.map((p) => (
              <ResultRow
                key={p.id}
                href={`/list/parents`}
                title={`${p.name} ${p.surname}`}
                subtitle={`@${p.username} · ${p.phone}`}
              />
            ))}
          </ResultSection>
        </div>
      )}
    </div>
  );
};

const ResultSection = ({
  title,
  count,
  emptyHidden,
  children,
}: {
  title: string;
  count: number;
  emptyHidden?: boolean;
  children: React.ReactNode;
}) => {
  if (emptyHidden && count === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-ink">
        {title} <span className="text-ink-subtle font-normal">({count})</span>
      </h2>
      <div className="rounded-xl border border-line divide-y divide-line">
        {children}
      </div>
    </section>
  );
};

const ResultRow = ({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) => (
  <Link
    href={href}
    className="block px-4 py-3 hover:bg-surface-subtle transition"
  >
    <div className="text-sm font-medium text-ink">{title}</div>
    {subtitle && <div className="text-xs text-ink-muted">{subtitle}</div>}
  </Link>
);

export default SearchPage;
