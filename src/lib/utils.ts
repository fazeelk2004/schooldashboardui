const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Sunday = 0, Monday = 1, Tuesday = 2, etc.
  // If today is Sunday, latest Monday was 6 days ago.
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return monday;
};

export const adjustScheduleToCurrentWeek = <
  T extends { title: string; start: Date; end: Date }
>(
  lessons: T[]
): T[] => {
  const latestMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);
    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );

    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      ...lesson,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

// --- Multi-school helpers ---
import { auth } from "@clerk/nextjs/server";

type UserMetadata = { role?: string; schoolId?: number };

export function getCurrentUser() {
  const { userId, sessionClaims } = auth();
  const metadata = sessionClaims?.metadata as UserMetadata | undefined;
  const role = metadata?.role;
  const schoolId = metadata?.schoolId;
  return { userId, role, schoolId };
}

/** Returns a Prisma `where` fragment: { schoolId } for school-scoped users, or {} for superadmin */
export function schoolFilter(schoolId: number | undefined) {
  return schoolId ? { schoolId } : {};
}

/** YYYY-MM-DD in the machine's local timezone (not UTC), so the date follows the PC clock. */
export function getLocalDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
