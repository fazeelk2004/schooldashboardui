import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/utils";

// GET /api/student/[id]/summary
// Returns a current-month summary report for a student.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, role, schoolId } = getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = params.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { select: { id: true, name: true } },
        grade: { select: { level: true } },
        school: { select: { name: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Authorization: superadmin sees all; admin/teacher restricted to their school;
    // students/parents may only view their own record (or their child).
    if (role !== "superadmin") {
      if (schoolId && student.schoolId !== schoolId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (role === "student" && userId !== studentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (role === "parent" && student.parentId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    const [attendance, results, quizSubmissions, announcements] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          studentId,
          date: { gte: monthStart, lt: monthEnd },
        },
        include: {
          lesson: {
            select: {
              name: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.result.findMany({
        where: {
          studentId,
          OR: [
            {
              exam: {
                date: { gte: monthStart, lt: monthEnd },
              },
            },
            {
              assignment: {
                dueDate: { gte: monthStart, lt: monthEnd },
              },
            },
          ],
        },
        include: {
          exam: {
            select: {
              title: true,
              date: true,
              subject: { select: { name: true } },
            },
          },
          assignment: {
            select: {
              dueDate: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
      prisma.quizSubmission.findMany({
        where: {
          studentId,
          submittedAt: { gte: monthStart, lt: monthEnd },
        },
        include: {
          quizAssignment: {
            include: {
              quiz: { select: { title: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.announcement.findMany({
        where: {
          date: { gte: monthStart, lt: monthEnd },
          OR: [{ classId: student.classId }, { classId: null }],
          schoolId: student.schoolId,
        },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);

    // Attendance aggregates
    const totalAttendance = attendance.length;
    const presentDays = attendance.filter((a) => a.present).length;
    const absentDays = totalAttendance - presentDays;
    const attendancePct =
      totalAttendance > 0 ? Math.round((presentDays / totalAttendance) * 100) : null;

    // Group attendance by subject for breakdown
    const subjectMap = new Map<string, { total: number; present: number }>();
    for (const a of attendance) {
      const subject = a.lesson?.subject?.name ?? "Other";
      const entry = subjectMap.get(subject) ?? { total: 0, present: 0 };
      entry.total += 1;
      if (a.present) entry.present += 1;
      subjectMap.set(subject, entry);
    }
    const attendanceBySubject = Array.from(subjectMap.entries()).map(
      ([subject, v]) => ({
        subject,
        total: v.total,
        present: v.present,
        absent: v.total - v.present,
        percentage: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
      })
    );

    // Result aggregates
    const examResults = results.filter((r) => r.examId !== null);
    const assignmentResults = results.filter((r) => r.assignmentId !== null);
    const totalScore = results.reduce((s, r) => s + (r.score ?? 0), 0);
    const avgScore =
      results.length > 0 ? Math.round(totalScore / results.length) : null;

    const resultEntries = results.map((r) => ({
      id: r.id,
      score: r.score,
      type: r.examId ? "Exam" : "Assignment",
      title:
        r.exam?.title ??
        (r.assignment
          ? `${r.assignment.subject?.name ?? "Assignment"} (Due ${new Date(
              r.assignment.dueDate
            ).toLocaleDateString()})`
          : "—"),
      subject: r.exam?.subject?.name ?? r.assignment?.subject?.name ?? "—",
      date: r.exam?.date ?? r.assignment?.dueDate ?? null,
    }));

    // Quiz aggregates
    const quizEntries = quizSubmissions.map((q) => ({
      id: q.id,
      title: q.quizAssignment?.quiz?.title ?? "Quiz",
      score: q.score,
      totalMarks: q.totalMarks,
      percentage:
        q.totalMarks > 0 ? Math.round((q.score / q.totalMarks) * 100) : 0,
      submittedAt: q.submittedAt,
    }));
    const quizAvg =
      quizEntries.length > 0
        ? Math.round(
            quizEntries.reduce((s, q) => s + q.percentage, 0) / quizEntries.length
          )
        : null;

    // Daily attendance entries (most-recent first)
    const attendanceEntries = attendance.map((a) => ({
      id: a.id,
      date: a.date,
      present: a.present,
      lesson: a.lesson?.name ?? "—",
      subject: a.lesson?.subject?.name ?? "—",
    }));

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        surname: student.surname,
        username: student.username,
        img: student.img,
        className: student.class?.name,
        gradeLevel: student.grade?.level,
        schoolName: student.school?.name,
      },
      period: {
        start: monthStart.toISOString(),
        end: monthEnd.toISOString(),
        label: monthStart.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        }),
      },
      attendance: {
        total: totalAttendance,
        present: presentDays,
        absent: absentDays,
        percentage: attendancePct,
        bySubject: attendanceBySubject,
        entries: attendanceEntries,
      },
      academics: {
        avgScore,
        totalResults: results.length,
        examCount: examResults.length,
        assignmentCount: assignmentResults.length,
        entries: resultEntries,
      },
      quizzes: {
        count: quizEntries.length,
        averagePercentage: quizAvg,
        entries: quizEntries,
      },
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        date: a.date,
      })),
    });
  } catch (err) {
    console.error("Student summary error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
