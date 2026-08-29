import prisma from "@/lib/prisma";
import { getCurrentUser, getLocalDateStr } from "@/lib/utils";
import AttendanceMarker from "@/components/AttendanceMarker";
import AttendanceViewer from "@/components/AttendanceViewer";
import DashboardWelcome from "@/components/DashboardWelcome";

const DAY_ENUM = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

const AttendanceListPage = async () => {
  const { userId, role, schoolId } = getCurrentUser();

  const todayDayName = DAY_ENUM[new Date().getDay()];

  // ── TEACHER: marker view ─────────────────────────────────────────
  if (role === "teacher") {
    const lessons = await prisma.lesson.findMany({
      where: {
        teacherId: userId!,
        day: todayDayName as any,
      },
      select: {
        id: true,
        name: true,
        day: true,
        startTime: true,
        endTime: true,
        class: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    const lessonIds = lessons.map((l) => l.id);
    const classIds = Array.from(new Set(lessons.map((l) => l.class.id)));

    const students = await prisma.student.findMany({
      where: {
        classId: { in: classIds },
        ...(schoolId ? { schoolId } : {}),
      },
      select: { id: true, name: true, surname: true, classId: true },
      orderBy: [{ surname: "asc" }, { name: "asc" }],
    });

    const studentsByLesson: Record<
      number,
      { id: string; name: string; surname: string }[]
    > = {};
    lessons.forEach((lesson) => {
      studentsByLesson[lesson.id] = students.filter(
        (s) => s.classId === lesson.class.id
      );
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existingRecords = lessonIds.length
      ? await prisma.attendance.findMany({
          where: {
            lessonId: { in: lessonIds },
            date: { gte: todayStart, lte: todayEnd },
          },
          select: { studentId: true, lessonId: true, date: true, present: true },
        })
      : [];

    const todayStr = getLocalDateStr();
    const existingAttendance: Record<string, boolean> = {};
    existingRecords.forEach((r) => {
      const key = `${r.studentId}-${r.lessonId}-${todayStr}`;
      existingAttendance[key] = r.present;
    });

    return (
      <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
        <DashboardWelcome
          role="Teacher · Attendance"
          title="Keep every lesson accounted for."
          description={`Mark today’s active lesson quickly and confidently. You have ${lessons.length} lesson${lessons.length !== 1 ? "s" : ""} scheduled today.`}
        />

        {lessons.length === 0 ? (
          <EmptyState
            title="No lessons today"
            message="You have no lessons scheduled for today."
          />
        ) : (
          <AttendanceMarker
            lessons={lessons.map((l) => ({
              id: l.id,
              name: l.name,
              day: l.day,
              startTime: l.startTime.toISOString(),
              endTime: l.endTime.toISOString(),
              class: { name: l.class.name },
            }))}
            studentsByLesson={studentsByLesson}
            existingAttendance={existingAttendance}
            today={todayStr}
            todayDayName={todayDayName}
          />
        )}
      </div>
    );
  }

  // ── ADMIN / SUPERADMIN / STUDENT / PARENT: read-only viewer ─────
  type AttendanceWhere = {
    schoolId?: number;
    studentId?: string | { in: string[] };
    lesson?: { schoolId: number };
  };

  let where: AttendanceWhere = {};

  if (role === "student") {
    where = { studentId: userId! };
  } else if (role === "parent") {
    const children = await prisma.student.findMany({
      where: { parentId: userId! },
      select: { id: true },
    });
    where = { studentId: { in: children.map((c) => c.id) } };
  } else if (role === "admin" && schoolId) {
    where = { lesson: { schoolId } };
  }
  // superadmin: no scoping (all)

  const records = await prisma.attendance.findMany({
    where,
    select: {
      id: true,
      date: true,
      present: true,
      student: { select: { id: true, name: true, surname: true } },
      lesson: {
        select: {
          name: true,
          class: { select: { name: true } },
          subject: { select: { name: true } },
          teacher: { select: { name: true, surname: true } },
        },
      },
    },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <div className="dashboard-page flex flex-col gap-6 p-4 sm:p-6 lg:p-7">
      <DashboardWelcome
        role={`${role ?? "School"} · Attendance`}
        title="Attendance, made clear."
        description={role === "parent" ? "See attendance patterns and individual lesson records for your children." : role === "student" ? "Review your attendance history and keep track of every recorded lesson." : "Review attendance records across the school with simple, focused filtering."}
      />

      <AttendanceViewer
        role={role ?? ""}
        records={records.map((r) => ({
          id: r.id,
          date: r.date.toISOString(),
          present: r.present,
          studentName: `${r.student.name} ${r.student.surname}`,
          lessonName: r.lesson.name,
          className: r.lesson.class.name,
          subjectName: r.lesson.subject.name,
          teacherName: `${r.lesson.teacher.name} ${r.lesson.teacher.surname}`,
        }))}
      />
    </div>
  );
};

const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <div className="dashboard-card rounded-[24px] border border-line/75 bg-surface p-16 text-center shadow-soft">
    <div className="w-12 h-12 mx-auto rounded-full bg-surface-subtle border border-line flex items-center justify-center text-ink-subtle mb-4">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
    </div>
    <h2 className="text-base font-semibold text-ink mb-1">{title}</h2>
    <p className="text-sm text-ink-muted">{message}</p>
  </div>
);

export default AttendanceListPage;
