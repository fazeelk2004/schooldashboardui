import Image from "next/image";
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";

const CountChartContainer = async () => {
  const { role, schoolId } = getCurrentUser();

  const whereClause = role !== "superadmin" && schoolId ? { schoolId } : {};

  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
    where: whereClause,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="h-full w-full rounded-2xl border border-line bg-surface p-5 shadow-soft">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Students</h2>
          <p className="text-xs text-ink-subtle">Distribution by sex</p>
        </div>
      </div>
      {/* CHART */}
      <CountChart boys={boys} girls={girls} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-12">
        <div className="flex flex-col items-start gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          <p className="text-lg font-semibold text-ink">{boys}</p>
          <p className="text-xs text-ink-subtle">
            Boys ({Math.round((boys / (boys + girls)) * 100) || 0}%)
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <p className="text-lg font-semibold text-ink">{girls}</p>
          <p className="text-xs text-ink-subtle">
            Girls ({Math.round((girls / (boys + girls)) * 100) || 0}%)
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
