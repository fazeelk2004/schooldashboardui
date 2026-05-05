import prisma from "@/lib/prisma";
import BigCalendar, { CalendarEvent } from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where:
      type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number },

    include: {
      subject: true,
      teacher: true,
      class: true,
    },
  });

  const data: CalendarEvent[] = dataRes.map((lesson) => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
    subjectName: lesson.subject.name,
    teacherName: `${lesson.teacher.name} ${lesson.teacher.surname}`,
    className: lesson.class.name,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 md:p-5 shadow-soft h-full">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;