import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { getCurrentUser } from "@/lib/utils";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "school"
    | "admin"
    | "grade";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, role, schoolId: currentSchoolId } = getCurrentUser();
  const currentUserId = userId;

  // School filter: if admin, scope to their school; if superadmin, no filter
  const sf = currentSchoolId ? { schoolId: currentSchoolId } : {};

  if (type !== "delete") {
    switch (table) {
      case "admin":
        // Admin creation is superadmin-only; always show all schools
        const adminSchools = await prisma.school.findMany({
          select: { id: true, name: true },
        });
        relatedData = { schools: adminSchools, currentSchoolId };
        break;

      case "school":
        // No related data needed
        break;

      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          where: sf,
          select: { id: true, name: true, surname: true },
        });
        const subjectSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { teachers: subjectTeachers, schools: subjectSchools, currentSchoolId };
        break;

      case "grade":
        const gradeSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { schools: gradeSchools, currentSchoolId };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          where: sf,
          select: { id: true, level: true, schoolId: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          where: sf,
          select: { id: true, name: true, surname: true },
        });
        const classSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { teachers: classTeachers, grades: classGrades, schools: classSchools, currentSchoolId };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          where: sf,
          select: { id: true, name: true },
        });
        const teacherSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { subjects: teacherSubjects, schools: teacherSchools, currentSchoolId };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          where: sf,
          select: { id: true, level: true, schoolId: true },
        });
        const studentClasses = await prisma.class.findMany({
          where: sf,
          include: { _count: { select: { students: true } } },
        });
        const studentSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { classes: studentClasses, grades: studentGrades, schools: studentSchools, currentSchoolId };
        break;

      case "exam":
        const examSubjects = await prisma.subject.findMany({
          where: {
            ...sf,
            ...(role === "teacher"
              ? { teachers: { some: { id: currentUserId! } } }
              : {}),
          },
          select: { id: true, name: true },
        });
        const examGrades = await prisma.grade.findMany({
          where: sf,
          select: { id: true, level: true },
        });
        const examSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { subjects: examSubjects, grades: examGrades, schools: examSchools, currentSchoolId };
        break;

      case "parent":
        const parentStudents = await prisma.student.findMany({
          where: sf,
          select: { id: true, name: true, surname: true },
        });
        const parentSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { schools: parentSchools, students: parentStudents, currentSchoolId };
        break;

      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          where: sf,
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          where: sf,
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          where: sf,
          select: { id: true, name: true, surname: true },
        });
        const lessonSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers, schools: lessonSchools, currentSchoolId };
        break;

      case "assignment":
        const assignmentSubjects = await prisma.subject.findMany({
          where: sf,
          select: { id: true, name: true },
        });
        const assignmentGrades = await prisma.grade.findMany({
          where: sf,
          select: { id: true, level: true },
        });
        const assignmentSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { subjects: assignmentSubjects, grades: assignmentGrades, schools: assignmentSchools, currentSchoolId };
        break;

      case "result":
        const resultExams = await prisma.exam.findMany({
          where: sf,
          select: { id: true, title: true },
        });
        const resultAssignmentsRaw = await prisma.assignment.findMany({
          where: sf,
          select: {
            id: true,
            dueDate: true,
            subject: { select: { name: true } },
            grade: { select: { level: true } },
          },
        });
        const resultAssignments = resultAssignmentsRaw.map((a) => ({
          id: a.id,
          title: `${a.subject.name} - Grade ${a.grade.level}`,
        }));
        const resultStudents = await prisma.student.findMany({
          where: sf,
          select: { id: true, name: true, surname: true },
        });
        relatedData = { exams: resultExams, assignments: resultAssignments, students: resultStudents, currentSchoolId };
        break;

      case "event":
        const eventClasses = await prisma.class.findMany({
          where: sf,
          select: { id: true, name: true },
        });
        const eventSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { classes: eventClasses, schools: eventSchools, currentSchoolId };
        break;

      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          where: sf,
          select: { id: true, name: true },
        });
        const announcementSchools = role === "superadmin"
          ? await prisma.school.findMany({ select: { id: true, name: true } })
          : [];
        relatedData = { classes: announcementClasses, schools: announcementSchools, currentSchoolId };
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;

