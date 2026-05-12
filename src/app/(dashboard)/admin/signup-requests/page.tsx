import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import PendingSignupCard from "./PendingSignupCard";

export const dynamic = "force-dynamic";

export default async function AdminSignupRequestsPage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const schoolId = (sessionClaims?.metadata as { schoolId?: number })?.schoolId;

  if (role !== "admin" || !schoolId) {
    redirect("/sign-in");
  }

  const [pending, classes, grades] = await prisma.$transaction([
    prisma.pendingStudentSignup.findMany({
      where: { schoolId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        gradeId: true,
        capacity: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.grade.findMany({
      where: { schoolId },
      select: { id: true, level: true },
      orderBy: { level: "asc" },
    }),
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Student signup requests
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Review pending applications, assign a class, and accept or decline.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
          <h2 className="text-base font-medium">No pending requests</h2>
          <p className="mt-1 text-sm text-ink-muted">
            New student applications will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pending.map((p) => (
            <PendingSignupCard
              key={p.id}
              request={{
                id: p.id,
                createdAt: p.createdAt.toISOString(),
                studentData: p.studentData as any,
                parentMode: p.parentMode,
                parentData: p.parentData as any,
                existingParentUsername: p.existingParentUsername,
              }}
              classes={classes.map((c) => ({
                id: c.id,
                name: c.name,
                gradeId: c.gradeId,
                capacity: c.capacity,
                studentCount: c._count.students,
              }))}
              grades={grades}
            />
          ))}
        </div>
      )}
    </div>
  );
}
