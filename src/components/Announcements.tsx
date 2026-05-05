import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";

const Announcements = async () => {
  const { userId, role, schoolId } = getCurrentUser();

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      // School scoping for non-superadmin
      ...(role !== "superadmin" && schoolId ? { schoolId } : {}),
      // Role-based filtering for non-admin/non-superadmin
      ...(role !== "admin" && role !== "superadmin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  const accents = [
    "border-l-sky-400",
    "border-l-violet-400",
    "border-l-amber-400",
  ];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">Announcements</h2>
        <span className="text-xs font-medium text-brand hover:underline cursor-pointer">
          View all
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {data.length === 0 && (
          <div className="rounded-xl border border-dashed border-line p-5 text-center text-xs text-ink-subtle">
            No announcements yet.
          </div>
        )}
        {data.map((a, i) => (
          <div
            key={a.id}
            className={`rounded-xl border border-line bg-surface-muted p-4 border-l-4 ${
              accents[i % accents.length]
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">{a.title}</h3>
              <span className="shrink-0 rounded-md bg-surface px-2 py-0.5 text-[11px] text-ink-subtle border border-line">
                {new Intl.DateTimeFormat("en-GB").format(a.date)}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-ink-muted line-clamp-3">
              {a.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
