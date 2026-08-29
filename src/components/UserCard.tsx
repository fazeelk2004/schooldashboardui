import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const { role, schoolId } = getCurrentUser();

  // Build where clause: superadmin sees all, others see only their school
  const whereClause = role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {};

  const modelMap: Record<string, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count({ where: whereClause });

  const accent: Record<string, string> = {
    admin: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300",
    teacher: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300",
    student: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300",
    parent: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  };

  return (
    <div className="metric-card group relative min-w-[140px] flex-1 overflow-hidden rounded-[20px] border border-line/75 bg-surface p-5 shadow-soft">
      <span className="metric-card-glow absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/10 blur-3xl" />
      <div className="flex items-center justify-between">
        <div
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${accent[type]}`}
        >
          <Image src={`/${type}.png`} alt="" width={18} height={18} />
        </div>
        <span className="relative inline-flex items-center gap-1.5 rounded-full border border-line/70 bg-surface-muted px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-ink-subtle">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
        </span>
      </div>
      <p className="relative mt-5 text-3xl font-bold tracking-[-0.045em] text-ink">
        {data.toLocaleString()}
      </p>
      <p className="relative mt-1 text-xs font-semibold capitalize text-ink-muted">Total {type}s</p>
    </div>
  );
};

export default UserCard;
