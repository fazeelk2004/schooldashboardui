import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import DashboardWelcome from "@/components/DashboardWelcome";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Admin"
        description="Your school at a glance—people, attendance, events, and the signals that need your attention today."
        actions={[
          { label: "View attendance", href: "/list/attendance", primary: true },
          { label: "Manage students", href: "/list/students" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-6">
        {/* USER CARDS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
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

export default AdminPage;
