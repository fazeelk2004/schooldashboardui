import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";
import AttendanceMarker from "@/components/AttendanceMarker";

const AttendanceListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, role, schoolId } = getCurrentUser();

  // Teachers only see their own lessons; admins/superadmins see all school lessons
  const lessons = await prisma.lesson.findMany({
    where: {
      ...(role === "teacher" ? { teacherId: userId! } : {}),
      ...(role === "admin" && schoolId ? { schoolId } : {}),
    },
    select: {
      id: true,
      name: true,
      class: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  const lessonIds = lessons.map((l) => l.id);

  // Fetch all students across all selected lessons' classes
  const classIds = Array.from(new Set(lessons.map((l) => l.class.id)));
  const students = await prisma.student.findMany({
    where: {
      classId: { in: classIds },
      ...(schoolId ? { schoolId } : {}),
    },
    select: {
      id: true,
      name: true,
      surname: true,
      classId: true,
    },
    orderBy: [{ surname: "asc" }, { name: "asc" }],
  });

  // Build a map: lessonId → students[]
  const lessonClassMap: Record<number, number> = {};
  lessons.forEach((l) => (lessonClassMap[l.id] = l.class.id));

  const studentsByLesson: Record<number, { id: string; name: string; surname: string }[]> = {};
  lessons.forEach((lesson) => {
    studentsByLesson[lesson.id] = students.filter(
      (s) => s.classId === lesson.class.id
    );
  });

  // Fetch existing attendance for this week to pre-fill checkboxes
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const existingRecords = lessonIds.length > 0
    ? await prisma.attendance.findMany({
        where: {
          lessonId: { in: lessonIds },
          date: { gte: weekStart },
        },
        select: {
          studentId: true,
          lessonId: true,
          date: true,
          present: true,
        },
      })
    : [];

  // Build lookup: `${studentId}-${lessonId}-${date}` → present
  const existingAttendance: Record<string, boolean> = {};
  existingRecords.forEach((r) => {
    const dateStr = new Date(r.date).toISOString().slice(0, 10);
    const key = `${r.studentId}-${r.lessonId}-${dateStr}`;
    existingAttendance[key] = r.present;
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-sm text-gray-400 mt-1">
            Select a lesson and date, then mark students as present or absent.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
          <span className="text-blue-500 text-xs font-medium">
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} available
          </span>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No lessons found</h2>
          <p className="text-sm text-gray-400">
            {role === "teacher"
              ? "You have no lessons assigned to you yet."
              : "No lessons found for this school."}
          </p>
        </div>
      ) : (
        <AttendanceMarker
          lessons={lessons.map((l) => ({
            id: l.id,
            name: l.name,
            class: { name: l.class.name },
          }))}
          studentsByLesson={studentsByLesson}
          existingAttendance={existingAttendance}
        />
      )}
    </div>
  );
};

export default AttendanceListPage;
