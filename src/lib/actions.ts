"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  SchoolSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  ParentSchema,
  LessonSchema,
  AssignmentSchema,
  ResultSchema,
  EventSchema,
  AnnouncementSchema,
  AdminSchema,
  GradeSchema,
  lessonSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { getCurrentUser, getLocalDateStr } from "./utils";
import { assertWithinLimit, PlanLimitError } from "./plans";

type CurrentState = { success: boolean; error: boolean };

// ─── NOTIFICATION HELPERS ───────────────────────────────────────────

type NotifyType = "ASSIGNMENT" | "EXAM" | "QUIZ" | "STUDENT" | "ANNOUNCEMENT" | "GENERAL";

const createNotificationsForUsers = async (
  userIds: string[],
  schoolId: number,
  title: string,
  description: string,
  type: NotifyType,
  link?: string
) => {
  if (!userIds.length) return;
  try {
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        schoolId,
        title,
        description,
        type: type as any,
        link: link ?? null,
      })),
    });
  } catch (err) {
    console.error("createNotificationsForUsers failed:", err);
  }
};

const notifyStudentsOfGrade = async (
  gradeId: number,
  schoolId: number,
  title: string,
  description: string,
  type: NotifyType,
  link?: string
) => {
  const students = await prisma.student.findMany({
    where: { gradeId, schoolId },
    select: { id: true },
  });
  await createNotificationsForUsers(
    students.map((s) => s.id),
    schoolId,
    title,
    description,
    type,
    link
  );
};

const notifyStudentsOfClass = async (
  classId: number,
  schoolId: number,
  title: string,
  description: string,
  type: NotifyType,
  link?: string
) => {
  const students = await prisma.student.findMany({
    where: { classId, schoolId },
    select: { id: true },
  });
  await createNotificationsForUsers(
    students.map((s) => s.id),
    schoolId,
    title,
    description,
    type,
    link
  );
};

const notifyTeachersOfSchool = async (
  schoolId: number,
  title: string,
  description: string,
  type: NotifyType,
  link?: string
) => {
  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    select: { id: true },
  });
  await createNotificationsForUsers(
    teachers.map((t) => t.id),
    schoolId,
    title,
    description,
    type,
    link
  );
};

export const markNotificationsRead = async (ids?: number[]) => {
  try {
    const { userId } = getCurrentUser();
    if (!userId) return { success: false, error: true };
    await prisma.notification.updateMany({
      where: {
        userId,
        ...(ids && ids.length ? { id: { in: ids } } : { read: false }),
      },
      data: { read: true },
    });
    revalidatePath("/");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// SCHOOL ACTIONS

export const createSchool = async (
  currentState: CurrentState,
  data: SchoolSchema
) => {
  try {
    await prisma.school.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        img: data.img || null,
        description: data.description || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSchool = async (
  currentState: CurrentState,
  data: SchoolSchema
) => {
  try {
    await prisma.school.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        img: data.img || null,
        description: data.description || null,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSchool = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.school.delete({
      where: {
        id: parseInt(id),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// SUBJECT ACTIONS

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        schoolId: data.schoolId,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        schoolId: data.schoolId,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// CLASS ACTIONS

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
        schoolId: data.schoolId,
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        capacity: data.capacity,
        gradeId: data.gradeId,
        supervisorId: data.supervisorId || null,
        schoolId: data.schoolId,
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// GRADE ACTIONS

export const createGrade = async (
  currentState: CurrentState,
  data: GradeSchema
) => {
  try {
    await prisma.grade.create({
      data: {
        level: data.level,
        schoolId: data.schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateGrade = async (
  currentState: CurrentState,
  data: GradeSchema
) => {
  try {
    await prisma.grade.update({
      where: { id: data.id },
      data: {
        level: data.level,
        schoolId: data.schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteGrade = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.grade.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// TEACHER ACTIONS

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    await assertWithinLimit(data.schoolId, "teachers");
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher", schoolId: data.schoolId}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        schoolId: data.schoolId,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher", schoolId: data.schoolId },
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        schoolId: data.schoolId,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// STUDENT ACTIONS

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    await assertWithinLimit(data.schoolId, "students");
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"student", schoolId: data.schoolId}
    });

    await (prisma.student.create as any)({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        ...(data.parentId ? { parentId: data.parentId } : {}),
        schoolId: data.schoolId,
      },
    });

    await notifyTeachersOfSchool(
      data.schoolId,
      "New student enrolled",
      `${data.name} ${data.surname} has been added to the school.`,
      "STUDENT",
      "/list/students"
    );

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "student", schoolId: data.schoolId },
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        ...(data.parentId ? { parentId: data.parentId } : {}),
        schoolId: data.schoolId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// EXAM ACTIONS

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        schoolId: data.schoolId,
      },
      include: { subject: { select: { name: true } } },
    });

    await notifyStudentsOfGrade(
      data.gradeId,
      data.schoolId,
      `New exam: ${exam.title}`,
      `A new ${exam.subject.name} exam has been scheduled for ${new Intl.DateTimeFormat("en-GB").format(exam.date)}.`,
      "EXAM",
      "/list/exams"
    );

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        schoolId: data.schoolId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ADMIN ACTIONS

export const createAdmin = async (
  currentState: CurrentState,
  data: AdminSchema
) => {
  try {
    await assertWithinLimit(data.schoolId, "admins");
    const user = await clerkClient().users.createUser({
      username: data.username,
      password: data.password,
      publicMetadata: { role: "admin", schoolId: data.schoolId },
    });

    await prisma.admin.create({
      data: {
        id: user.id,
        username: data.username,
        schoolId: data.schoolId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAdmin = async (
  currentState: CurrentState,
  data: AdminSchema
) => {
  try {
    const user = await clerkClient().users.updateUser(data.id!, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      publicMetadata: { role: "admin", schoolId: data.schoolId },
    });

    await prisma.admin.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        schoolId: data.schoolId,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAdmin = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await clerkClient().users.deleteUser(id);

    await prisma.admin.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// PARENT ACTIONS

export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient().users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent", schoolId: data.schoolId },
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        schoolId: data.schoolId,
        ...(data.students && data.students.length > 0 && {
          students: { connect: data.students.map((id) => ({ id })) },
        }),
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient().users.updateUser(data.id!, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "parent", schoolId: data.schoolId },
    });

    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        schoolId: data.schoolId,
        students: { set: data.students?.map((id) => ({ id })) ?? [] },
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    await clerkClient().users.deleteUser(id);

    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// LESSON ACTIONS

export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  const parsed = lessonSchema.safeParse(data);
  if (!parsed.success) {
    console.log("createLesson validation failed:", parsed.error.flatten());
    return { success: false, error: true };
  }
  const d = parsed.data;
  try {
    await prisma.lesson.create({
      data: {
        name: d.name,
        day: d.day,
        startTime: d.startTime,
        endTime: d.endTime,
        semesterStart: d.semesterStart,
        semesterEnd: d.semesterEnd,
        subjectId: d.subjectId,
        classId: d.classId,
        teacherId: d.teacherId,
        schoolId: d.schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log("createLesson prisma error:", err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  const parsed = lessonSchema.safeParse(data);
  if (!parsed.success) {
    console.log("updateLesson validation failed:", parsed.error.flatten());
    return { success: false, error: true };
  }
  const d = parsed.data;
  try {
    await prisma.lesson.update({
      where: { id: d.id! },
      data: {
        name: d.name,
        day: d.day,
        startTime: d.startTime,
        endTime: d.endTime,
        semesterStart: d.semesterStart,
        semesterEnd: d.semesterEnd,
        subjectId: d.subjectId,
        classId: d.classId,
        teacherId: d.teacherId,
        schoolId: d.schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log("updateLesson prisma error:", err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ASSIGNMENT ACTIONS

export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const { schoolId: currentSchoolId } = getCurrentUser();
    const schoolId = currentSchoolId ?? data.schoolId;
    if (!schoolId) return { success: false, error: true };
    const assignment = await prisma.assignment.create({
      data: {
        dueDate: data.dueDate,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        schoolId,
      },
      include: { subject: { select: { name: true } } },
    });

    await notifyStudentsOfGrade(
      data.gradeId,
      schoolId,
      `New assignment: ${assignment.subject.name}`,
      `A new assignment is due on ${new Intl.DateTimeFormat("en-GB").format(assignment.dueDate)}.`,
      "ASSIGNMENT",
      "/list/assignments"
    );

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    const { schoolId: currentSchoolId } = getCurrentUser();
    const schoolId = currentSchoolId ?? data.schoolId;
    if (!schoolId) return { success: false, error: true };
    await prisma.assignment.update({
      where: { id: data.id! },
      data: {
        dueDate: data.dueDate,
        subjectId: data.subjectId,
        gradeId: data.gradeId,
        schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// RESULT ACTIONS

export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: { id: data.id! },
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// EVENT ACTIONS

export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const { role, schoolId: currentSchoolId } = getCurrentUser();
    const effectiveSchoolId =
      role === "superadmin" ? data.schoolId : currentSchoolId;
    if (!effectiveSchoolId) {
      return { success: false, error: true };
    }

    if (data.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: data.classId },
        select: { schoolId: true },
      });
      if (!cls || cls.schoolId !== effectiveSchoolId) {
        return { success: false, error: true };
      }
    }

    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
        schoolId: effectiveSchoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    const { role, schoolId: currentSchoolId } = getCurrentUser();
    const existing = await prisma.event.findUnique({
      where: { id: data.id! },
      select: { schoolId: true },
    });
    if (!existing) return { success: false, error: true };
    if (role !== "superadmin" && existing.schoolId !== currentSchoolId) {
      return { success: false, error: true };
    }

    const effectiveSchoolId =
      role === "superadmin" ? data.schoolId : currentSchoolId!;

    if (data.classId) {
      const cls = await prisma.class.findUnique({
        where: { id: data.classId },
        select: { schoolId: true },
      });
      if (!cls || cls.schoolId !== effectiveSchoolId) {
        return { success: false, error: true };
      }
    }

    await prisma.event.update({
      where: { id: data.id! },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
        schoolId: effectiveSchoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const { role, schoolId: currentSchoolId } = getCurrentUser();
    const existing = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      select: { schoolId: true },
    });
    if (!existing) return { success: false, error: true };
    if (role !== "superadmin" && existing.schoolId !== currentSchoolId) {
      return { success: false, error: true };
    }
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ANNOUNCEMENT ACTIONS

export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
        schoolId: data.schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: { id: data.id! },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
        schoolId: data.schoolId,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
// ATTENDANCE ACTIONS

const DAY_ENUM = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

export const markAttendance = async (
  records: { studentId: string; lessonId: number; date: string; present: boolean }[]
): Promise<{ success: boolean; error: boolean; message?: string }> => {
  if (records.length === 0) return { success: true, error: false };

  try {
    const { userId, role } = getCurrentUser();

    if (role !== "teacher" || !userId) {
      return { success: false, error: true, message: "Only teachers can mark attendance." };
    }

    const lessonId = records[0].lessonId;
    if (records.some((r) => r.lessonId !== lessonId)) {
      return { success: false, error: true, message: "All records must be for the same lesson." };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, teacherId: true, day: true, startTime: true, endTime: true },
    });

    if (!lesson) {
      return { success: false, error: true, message: "Lesson not found." };
    }
    if (lesson.teacherId !== userId) {
      return { success: false, error: true, message: "You can only mark attendance for your own lessons." };
    }

    // Date must be today (server's local date, matching the PC clock).
    const now = new Date();
    const today = getLocalDateStr(now);
    if (records.some((r) => r.date !== today)) {
      return { success: false, error: true, message: "Attendance can only be marked for today's date." };
    }

    // Today's weekday must match the lesson's scheduled day.
    const todayDayName = DAY_ENUM[now.getDay()];
    if (todayDayName !== lesson.day) {
      return { success: false, error: true, message: "This lesson is not scheduled for today." };
    }

    // Current time-of-day must fall inside [startTime, endTime] (compared by HH:MM:SS only).
    const startTOD =
      lesson.startTime.getUTCHours() * 3600 +
      lesson.startTime.getUTCMinutes() * 60 +
      lesson.startTime.getUTCSeconds();
    const endTOD =
      lesson.endTime.getUTCHours() * 3600 +
      lesson.endTime.getUTCMinutes() * 60 +
      lesson.endTime.getUTCSeconds();
    const nowTOD = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    if (nowTOD < startTOD) {
      return { success: false, error: true, message: "The lesson has not started yet." };
    }
    if (nowTOD > endTOD) {
      return { success: false, error: true, message: "The lesson has already ended." };
    }

    const studentIds = records.map((r) => r.studentId);
    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: { lessonId, studentId: { in: studentIds } },
      }),
      prisma.attendance.createMany({
        data: records.map(({ studentId, lessonId: lId, date, present }) => ({
          studentId,
          lessonId: lId,
          date: new Date(date),
          present,
        })),
      }),
    ]);
    revalidatePath("/list/attendance");
    revalidatePath("/teacher");
    revalidatePath("/admin");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true, message: "Something went wrong." };
  }
};

// ─── QUIZ ACTIONS ───────────────────────────────────────────────────

export type GeneratedQuestion = {
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
};

export const saveQuiz = async (
  teacherId: string,
  schoolId: number,
  title: string,
  questions: GeneratedQuestion[]
): Promise<{ success: boolean; error: boolean; quizId?: number }> => {
  try {
    const quiz = await prisma.quiz.create({
      data: {
        title,
        type: "MCQ",
        teacherId,
        schoolId,
        questions: {
          create: questions.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            difficulty: q.difficulty,
          })),
        },
      },
    });
    revalidatePath("/list/quiz-generator");
    return { success: true, error: false, quizId: quiz.id };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const assignQuizToClass = async (
  quizId: number,
  classId: number,
  startTime: Date,
  endTime: Date,
  schoolId: number
): Promise<{ success: boolean; error: boolean; assignmentId?: number }> => {
  try {
    if (!(startTime instanceof Date) || !(endTime instanceof Date) || isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { success: false, error: true };
    }
    if (endTime.getTime() <= startTime.getTime()) {
      return { success: false, error: true };
    }
    const assignment = await prisma.quizAssignment.create({
      data: {
        quizId,
        classId,
        startTime,
        endTime,
        schoolId,
      },
      include: { quiz: { select: { title: true } } },
    });

    const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(startTime);
    const timeFmt = (d: Date) =>
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);

    await notifyStudentsOfClass(
      classId,
      schoolId,
      `New quiz: ${assignment.quiz.title}`,
      `A new quiz is scheduled for ${dateFmt} from ${timeFmt(startTime)} to ${timeFmt(endTime)}.`,
      "QUIZ",
      "/list/my-quizzes"
    );

    revalidatePath("/list/quiz-generator");
    revalidatePath("/list/my-quizzes");
    return { success: true, error: false, assignmentId: assignment.id };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

export const deleteQuiz = async (
  _currentState: CurrentState,
  data: FormData
): Promise<CurrentState> => {
  const id = data.get("id") as string;
  try {
    await prisma.quiz.delete({ where: { id: parseInt(id) } });
    revalidatePath("/list/quiz-generator");
    return { success: true, error: false };
  } catch (err) {
    console.error(err);
    return { success: false, error: true };
  }
};

// ─── PENDING STUDENT SIGNUP ACTIONS ─────────────────────────────────

export const acceptStudentSignup = async (
  pendingId: string,
  classId: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { userId, role, schoolId } = getCurrentUser();
    if (role !== "admin" || !schoolId || !userId) {
      return { success: false, message: "Unauthorized." };
    }

    const pending = await prisma.pendingStudentSignup.findUnique({
      where: { id: pendingId },
    });
    if (!pending || pending.schoolId !== schoolId) {
      return { success: false, message: "Request not found." };
    }
    if (pending.status !== "PENDING") {
      return { success: false, message: "Already reviewed." };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { students: true } } },
    });
    if (!classItem || classItem.schoolId !== schoolId) {
      return { success: false, message: "Invalid class." };
    }
    if (classItem._count.students >= classItem.capacity) {
      return { success: false, message: "Class is full." };
    }

    const sd = pending.studentData as any;
    if (classItem.gradeId !== sd.gradeId) {
      return {
        success: false,
        message: "Selected class does not belong to the student's grade.",
      };
    }

    try {
      await assertWithinLimit(schoolId, "students");
    } catch (err: any) {
      return {
        success: false,
        message: err?.message ?? "Plan limit reached.",
      };
    }

    let parentId: string | undefined;

    if (pending.parentMode === "EXISTING" && pending.existingParentUsername) {
      const parent = await prisma.parent.findFirst({
        where: {
          username: pending.existingParentUsername,
          schoolId,
        },
        select: { id: true },
      });
      if (!parent) {
        return {
          success: false,
          message: "Linked parent no longer exists.",
        };
      }
      parentId = parent.id;
    } else if (pending.parentMode === "NEW" && pending.parentData) {
      const pd = pending.parentData as any;
      const dupe = await prisma.parent.findUnique({
        where: { username: pd.username },
        select: { id: true },
      });
      if (dupe) {
        return {
          success: false,
          message: "Parent username is already taken.",
        };
      }
      const parentUser = await clerkClient().users.createUser({
        username: pd.username,
        password: pd.password,
        firstName: pd.name,
        lastName: pd.surname,
        publicMetadata: { role: "parent", schoolId },
      });
      await prisma.parent.create({
        data: {
          id: parentUser.id,
          username: pd.username,
          name: pd.name,
          surname: pd.surname,
          email: pd.email || null,
          phone: pd.phone,
          address: pd.address,
          schoolId,
        },
      });
      parentId = parentUser.id;
    }

    const studentUser = await clerkClient().users.createUser({
      username: sd.username,
      password: sd.password,
      firstName: sd.name,
      lastName: sd.surname,
      publicMetadata: { role: "student", schoolId },
    });

    await (prisma.student.create as any)({
      data: {
        id: studentUser.id,
        username: sd.username,
        name: sd.name,
        surname: sd.surname,
        email: sd.email || null,
        phone: sd.phone || null,
        address: sd.address,
        img: sd.img || null,
        bloodType: sd.bloodType,
        sex: sd.sex,
        birthday: new Date(sd.birthday),
        gradeId: sd.gradeId,
        classId,
        ...(parentId ? { parentId } : {}),
        schoolId,
      },
    });

    await prisma.pendingStudentSignup.update({
      where: { id: pendingId },
      data: {
        status: "ACCEPTED",
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
    });

    await notifyTeachersOfSchool(
      schoolId,
      "New student enrolled",
      `${sd.name} ${sd.surname} has been added to the school.`,
      "STUDENT",
      "/list/students"
    );

    revalidatePath("/admin/signup-requests");
    revalidatePath("/list/students");
    return { success: true };
  } catch (err: any) {
    console.error("[acceptStudentSignup]", err);
    return {
      success: false,
      message: err?.message ?? "Something went wrong.",
    };
  }
};

export const declineStudentSignup = async (
  pendingId: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { userId, role, schoolId } = getCurrentUser();
    if (role !== "admin" || !schoolId || !userId) {
      return { success: false, message: "Unauthorized." };
    }
    const pending = await prisma.pendingStudentSignup.findUnique({
      where: { id: pendingId },
    });
    if (!pending || pending.schoolId !== schoolId) {
      return { success: false, message: "Request not found." };
    }
    if (pending.status !== "PENDING") {
      return { success: false, message: "Already reviewed." };
    }
    await prisma.pendingStudentSignup.update({
      where: { id: pendingId },
      data: {
        status: "DECLINED",
        reviewedAt: new Date(),
        reviewedBy: userId,
      },
    });
    revalidatePath("/admin/signup-requests");
    return { success: true };
  } catch (err: any) {
    console.error("[declineStudentSignup]", err);
    return {
      success: false,
      message: err?.message ?? "Something went wrong.",
    };
  }
};

