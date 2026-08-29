import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import DashboardWelcome from "@/components/DashboardWelcome";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import prisma from "@/lib/prisma";
import Link from "next/link";

const SuperAdminPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  // Get all schools with counts
  const schools = await prisma.school.findMany({
    include: {
      _count: {
        select: {
          students: true,
          teachers: true,
          classes: true,
          admins: true,
        },
      },
    },
  });

  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Super admin"
        description="A unified view across every school, with organization-wide people, performance, and operational insight."
        actions={[{ label: "Manage schools", href: "/list/schools", primary: true }]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* LEFT */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* USER CARDS — aggregate across all schools */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>

        {/* SCHOOLS LIST */}
        <div className="dashboard-card rounded-[22px] border border-line/75 bg-surface p-5 shadow-soft">
          <div className="flex justify-between items-center mb-4">
            <div><span className="dashboard-section-kicker">Network</span><h2 className="mt-1 text-lg font-bold tracking-tight text-ink">All schools</h2></div>
            <Link
              href="/list/schools"
              className="text-xs font-bold text-brand hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <div
                key={school.id}
                className="group rounded-2xl border border-line/75 bg-surface-muted/45 p-4 transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-card"
              >
                <h3 className="font-bold text-ink">{school.name}</h3>
                <p className="mt-1 text-xs text-ink-subtle">
                  {school.address || "No address"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-ink-muted">
                  <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-600 dark:text-sky-300">
                    {school._count.students} Students
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-600 dark:text-amber-300">
                    {school._count.teachers} Teachers
                  </span>
                  <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-violet-600 dark:text-violet-300">
                    {school._count.classes} Classes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE CHARTS */}
        <div className="grid gap-6 lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.45fr)]">
          {/* COUNT CHART */}
          <div className="h-[430px] w-full">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="h-[430px] w-full">
            <AttendanceChartContainer />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <aside className="flex w-full flex-col gap-6">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </aside>
      </div>
    </div>
  );
};

export default SuperAdminPage;
