import prisma from "@/lib/prisma";

const StudentAttendanceCard = async ({ id }: { id: string }) => {
  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: {
        gte: new Date(new Date().getFullYear(), 0, 1),
      },
    },
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter((day) => day.present).length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

  return (
    <span className="text-2xl font-semibold text-ink">
      {percentage !== null ? `${percentage}%` : "—"}
    </span>
  );
};

export default StudentAttendanceCard;
