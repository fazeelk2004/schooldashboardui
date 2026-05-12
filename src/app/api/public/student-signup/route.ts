import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

const studentDataSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(1),
  bloodType: z.string().min(1),
  birthday: z.string().min(1),
  sex: z.enum(["MALE", "FEMALE"]),
  img: z.string().optional().or(z.literal("")),
  gradeId: z.coerce.number().min(1),
});

const newParentSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1),
  address: z.string().min(1),
});

const existingParentSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const bodySchema = z.object({
  schoolId: z.coerce.number().min(1),
  student: studentDataSchema,
  parentMode: z.enum(["NEW", "EXISTING", "NONE"]),
  newParent: newParentSchema.optional(),
  existingParent: existingParentSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const school = await prisma.school.findUnique({
      where: { id: data.schoolId },
      select: { id: true },
    });
    if (!school) {
      return NextResponse.json({ error: "School not found." }, { status: 404 });
    }

    const grade = await prisma.grade.findFirst({
      where: { id: data.student.gradeId, schoolId: data.schoolId },
      select: { id: true },
    });
    if (!grade) {
      return NextResponse.json(
        { error: "Selected grade does not belong to this school." },
        { status: 400 }
      );
    }

    if (data.parentMode === "NEW" && !data.newParent) {
      return NextResponse.json(
        { error: "New parent information is required." },
        { status: 400 }
      );
    }
    if (data.parentMode === "EXISTING" && !data.existingParent) {
      return NextResponse.json(
        { error: "Existing parent credentials are required." },
        { status: 400 }
      );
    }

    if (data.parentMode === "EXISTING" && data.existingParent) {
      const parent = await prisma.parent.findFirst({
        where: {
          username: data.existingParent.username,
          schoolId: data.schoolId,
        },
        select: { id: true },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "No parent with that username at this school." },
          { status: 404 }
        );
      }
      try {
        const usersList = await clerkClient.users.getUserList({
          username: [data.existingParent.username],
        });
        const clerkUser = usersList.data?.[0] ?? (usersList as any)[0];
        if (!clerkUser) {
          return NextResponse.json(
            { error: "Parent account not found." },
            { status: 404 }
          );
        }
        const verify = await clerkClient.users.verifyPassword({
          userId: clerkUser.id,
          password: data.existingParent.password,
        });
        if (!verify?.verified) {
          return NextResponse.json(
            { error: "Incorrect parent password." },
            { status: 401 }
          );
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: "Could not verify parent credentials." },
          { status: 401 }
        );
      }
    }

    const existingStudentUsername = await prisma.student.findUnique({
      where: { username: data.student.username },
      select: { id: true },
    });
    if (existingStudentUsername) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 409 }
      );
    }

    await prisma.pendingStudentSignup.create({
      data: {
        schoolId: data.schoolId,
        studentData: data.student as any,
        parentMode: data.parentMode,
        parentData:
          data.parentMode === "NEW"
            ? (data.newParent as any)
            : undefined,
        existingParentUsername:
          data.parentMode === "EXISTING"
            ? data.existingParent!.username
            : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[public/student-signup] error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
