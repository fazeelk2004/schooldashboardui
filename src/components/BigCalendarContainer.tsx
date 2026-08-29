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
    <div className="calendar-shell h-full rounded-2xl border border-line/70 bg-surface-muted/35 p-3 shadow-inner md:p-4">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
