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
  const whereClause = role !== "superadmin" && schoolId ? { schoolId } : {};

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
    <div className="flex-1 min-w-[140px] rounded-2xl border border-line bg-surface p-5 shadow-soft hover:shadow-card transition">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent[type]}`}
        >
          <Image src={`/${type}.png`} alt="" width={18} height={18} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
          Total
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {data.toLocaleString()}
      </p>
      <p className="mt-1 text-sm capitalize text-ink-muted">{type}s</p>
    </div>
  );
};

export default UserCard;
