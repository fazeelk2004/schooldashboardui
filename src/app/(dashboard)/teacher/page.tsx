import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import DashboardWelcome from "@/components/DashboardWelcome";
import { auth } from "@clerk/nextjs/server";

const TeacherPage = () => {
  const { userId } = auth();
  return (
    <div className="dashboard-page flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Teacher"
        description="Keep your teaching day focused with your timetable, class updates, attendance, and AI-assisted quiz tools in one place."
        actions={[
          { label: "Mark attendance", href: "/list/attendance", primary: true },
          { label: "Create a quiz", href: "/list/quiz-generator" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* LEFT */}
      <div className="min-w-0">
        <div className="dashboard-card h-full rounded-[22px] border border-line/75 bg-surface p-4 shadow-soft sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div><span className="dashboard-section-kicker">Weekly rhythm</span>
            <h2 className="mt-1.5 text-xl font-bold tracking-[-0.03em] text-ink">Your schedule</h2>
            <p className="mt-1 text-xs text-ink-subtle">
              Your weekly teaching timetable.
            </p></div>
            <span className="hidden rounded-full border border-line bg-surface-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-subtle sm:inline-flex">Live timetable</span>
          </div>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* RIGHT */}
      <aside className="flex w-full flex-col gap-6">
        <Announcements />
      </aside>
      </div>
    </div>
  );
};

export default TeacherPage;
