import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="flex flex-col gap-5 p-5 lg:flex-row">
      {/* LEFT */}
      <div className="flex w-full flex-col gap-5 lg:w-2/3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Overview
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            A snapshot of your school today.
          </p>
        </div>
        {/* USER CARDS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* COUNT CHART */}
          <div className="h-[450px] w-full lg:w-1/3">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="h-[450px] w-full lg:w-2/3">
            <AttendanceChartContainer />
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex w-full flex-col gap-5 lg:w-1/3">
        <EventCalendarContainer searchParams={searchParams} />
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
