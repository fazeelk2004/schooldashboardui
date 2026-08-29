import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import DashboardWelcome from "@/components/DashboardWelcome";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Student"
        description="Everything for your school day—lessons, quizzes, results, and the latest updates—organized around what comes next."
        actions={[
          { label: "Open my quizzes", href: "/list/my-quizzes", primary: true },
          { label: "View results", href: "/list/results" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* LEFT */}
      <div className="min-w-0">
        <div className="dashboard-card h-full rounded-[22px] border border-line/75 bg-surface p-4 shadow-soft sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div><span className="dashboard-section-kicker">Class timetable</span>
            <h2 className="mt-1.5 text-xl font-bold tracking-[-0.03em] text-ink">
              This week {classItem[0]?.name ? `· ${classItem[0].name}` : ""}
            </h2>
            <p className="mt-1 text-xs text-ink-subtle">
              Your class lessons for the week.
            </p></div>
          </div>
          {classItem[0] ? (
            <BigCalendarContainer type="classId" id={classItem[0].id} />
          ) : (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-line bg-surface-muted/50 text-sm text-ink-subtle">No class schedule is available yet.</div>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <aside className="flex w-full flex-col gap-6">
        <div className="dashboard-card rounded-[22px] border border-line/75 bg-surface p-5 shadow-soft">
          <div className="mb-2"><span className="dashboard-section-kicker">Plan ahead</span></div>
          <EventCalendar />
        </div>
        <Announcements />
      </aside>
      </div>
    </div>
  );
};

export default StudentPage;
