import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
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
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS — aggregate across all schools */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>

        {/* SCHOOLS LIST */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-semibold">All Schools</h1>
            <Link
              href="/list/schools"
              className="text-xs text-blue-500 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schools.map((school) => (
              <div
                key={school.id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-gray-700">{school.name}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {school.address || "No address"}
                </p>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span className="bg-lamaSkyLight px-2 py-1 rounded">
                    {school._count.students} Students
                  </span>
                  <span className="bg-lamaYellowLight px-2 py-1 rounded">
                    {school._count.teachers} Teachers
                  </span>
                  <span className="bg-lamaPurpleLight px-2 py-1 rounded">
                    {school._count.classes} Classes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default SuperAdminPage;
