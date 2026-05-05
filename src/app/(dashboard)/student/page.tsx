import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
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

  console.log(classItem);
  return (
    <div className="flex flex-col gap-5 p-5 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-ink">
              Schedule {classItem[0]?.name ? `(${classItem[0].name})` : ""}
            </h1>
            <p className="text-xs text-ink-subtle mt-1">
              Your class lessons for the week.
            </p>
          </div>
          <BigCalendarContainer type="classId" id={classItem[0].id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="flex w-full flex-col gap-5 xl:w-1/3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <EventCalendar />
        </div>
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
