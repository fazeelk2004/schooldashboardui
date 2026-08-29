import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import DashboardWelcome from "@/components/DashboardWelcome";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


const ParentPage = async () => {
  const { userId } = auth();
  const currentUserId = userId;
  
  const students = await prisma.student.findMany({
    where: {
      parentId: currentUserId!,
    },
  });

  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role="Parent"
        description="Stay close to every child’s learning journey with schedules, attendance, results, and school updates in one calm view."
        actions={[
          { label: "View attendance", href: "/list/attendance", primary: true },
          { label: "View results", href: "/list/results" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      {/* LEFT */}
      <div className="flex min-w-0 flex-col gap-6">
        {students.map((student) => (
          <div
            className="dashboard-card h-full rounded-[22px] border border-line/75 bg-surface p-4 shadow-soft sm:p-5"
            key={student.id}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-xs font-bold text-brand">{student.name[0]}{student.surname[0]}</span>
              <div><span className="dashboard-section-kicker">Child schedule</span>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.03em] text-ink">
                {student.name + " " + student.surname}
              </h2>
              <p className="mt-1 text-xs text-ink-subtle">
                Class lessons for the week.
              </p></div>
            </div>
            <BigCalendarContainer type="classId" id={student.classId} />
          </div>
        ))}
        {students.length === 0 && <div className="dashboard-card flex min-h-64 items-center justify-center rounded-[22px] border border-dashed border-line bg-surface p-8 text-center text-sm text-ink-subtle">No students are connected to this parent account yet.</div>}
      </div>
      {/* RIGHT */}
      <aside className="flex w-full flex-col gap-6">
        <Announcements />
      </aside>
      </div>
    </div>
  );
};

export default ParentPage;
