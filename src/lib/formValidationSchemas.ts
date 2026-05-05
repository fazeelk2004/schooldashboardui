import { z } from "zod";

export const schoolSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "School name is required!" }),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  website: z.string().optional(),
  img: z.string().optional(),
  description: z.string().optional(),
});

export type SchoolSchema = z.infer<typeof schoolSchema>;

export const adminSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type AdminSchema = z.infer<typeof adminSchema>;

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const gradeSchema = z.object({
  id: z.coerce.number().optional(),
  level: z.coerce.number().min(1, { message: "Level is required!" }),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type GradeSchema = z.infer<typeof gradeSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().optional().or(z.literal("")),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

const timeStringToDate = (v: unknown) => {
  if (v instanceof Date) return v;
  if (typeof v === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(v)) {
    const [h, m] = v.split(":").map((n) => parseInt(n, 10));
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }
  return v;
};

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  startTime: z.preprocess(timeStringToDate, z.coerce.date({ message: "Start time is required!" })),
  endTime: z.preprocess(timeStringToDate, z.coerce.date({ message: "End time is required!" })),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  gradeId: z.coerce.number({ message: "Grade is required!" }),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  students: z.array(z.string()).optional(), // student ids
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Lesson name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], {
    message: "Day is required!",
  }),
  startTime: z.preprocess(timeStringToDate, z.coerce.date({ message: "Start time is required!" })),
  endTime: z.preprocess(timeStringToDate, z.coerce.date({ message: "End time is required!" })),
  semesterStart: z.coerce.date({ message: "Semester start is required!" }),
  semesterEnd: z.coerce.date({ message: "Semester end is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string({ message: "Teacher is required!" }),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
}).refine((d) => d.semesterEnd > d.semesterStart, {
  message: "Semester end must be after semester start",
  path: ["semesterEnd"],
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  gradeId: z.coerce.number({ message: "Grade is required!" }),
  schoolId: z.coerce.number().optional(),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0).max(100, { message: "Score must be 0-100" }),
  examId: z.coerce.number().optional().nullable(),
  assignmentId: z.coerce.number().optional().nullable(),
  studentId: z.string({ message: "Student is required!" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  classId: z.coerce.number().optional().nullable(),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  classId: z.coerce.number().optional().nullable(),
  schoolId: z.coerce.number().min(1, { message: "School is required!" }),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;
