import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = Number(searchParams.get("schoolId"));
  if (!schoolId || Number.isNaN(schoolId)) {
    return NextResponse.json({ grades: [] });
  }
  const grades = await prisma.grade.findMany({
    where: { schoolId },
    select: { id: true, level: true },
    orderBy: { level: "asc" },
  });
  return NextResponse.json({ grades });
}
