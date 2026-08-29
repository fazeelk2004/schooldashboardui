import CountChart from "./CountChart";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";

const CountChartContainer = async () => {
  const { role, schoolId } = getCurrentUser();

  const whereClause = role !== "superadmin" ? { schoolId: schoolId ?? -1 } : {};

  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
    where: whereClause,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;

  return (
    <div className="dashboard-card h-full w-full rounded-[22px] border border-line/75 bg-surface p-5 shadow-soft">
      {/* TITLE */}
      <div className="flex items-center justify-between">
        <div>
          <span className="dashboard-section-kicker">Community</span>
          <h2 className="mt-1 text-base font-bold text-ink">Student mix</h2>
          <p className="text-xs text-ink-subtle">Distribution across the school</p>
        </div>
      </div>
      {/* CHART */}
      <CountChart boys={boys} girls={girls} />
      {/* BOTTOM */}
      <div className="flex justify-center gap-12">
        <div className="flex flex-col items-start gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4f75ff] shadow-[0_0_0_4px_rgb(79_117_255/.1)]" />
          <p className="text-lg font-semibold text-ink">{boys}</p>
          <p className="text-xs text-ink-subtle">
            Boys ({Math.round((boys / (boys + girls)) * 100) || 0}%)
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500 shadow-[0_0_0_4px_rgb(139_92_246/.1)]" />
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
