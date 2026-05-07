import Image from "next/image";
import AttendanceChart from "./AttendanceChart";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";

const AttendanceChartContainer = async () => {
  const { role, schoolId } = getCurrentUser();

  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const lastMonday = new Date(today);

  lastMonday.setDate(today.getDate() - daysSinceMonday);

  const resData = await prisma.attendance.findMany({
    where: {
      date: {
        gte: lastMonday,
      },
      // scope to school through student relation
      ...(role !== "superadmin"
        ? { student: { schoolId: schoolId ?? -1 } }
        : {}),
    },
    select: {
      date: true,
      present: true,
    },
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const attendanceMap: { [key: string]: { present: number; absent: number } } =
    {
      Mon: { present: 0, absent: 0 },
      Tue: { present: 0, absent: 0 },
      Wed: { present: 0, absent: 0 },
      Thu: { present: 0, absent: 0 },
      Fri: { present: 0, absent: 0 },
    };

  resData.forEach((item) => {
    const itemDate = new Date(item.date);
    const dayOfWeek = itemDate.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const dayName = daysOfWeek[dayOfWeek - 1];

      if (item.present) {
        attendanceMap[dayName].present += 1;
      } else {
        attendanceMap[dayName].absent += 1;
      }
    }
  });

  const data = daysOfWeek.map((day) => ({
    name: day,
    present: attendanceMap[day].present,
    absent: attendanceMap[day].absent,
  }));

  return (
    <div className="h-full rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Attendance</h2>
          <p className="text-xs text-ink-subtle">This week</p>
        </div>
      </div>
      <AttendanceChart data={data} />
    </div>
  );
};

export default AttendanceChartContainer;
