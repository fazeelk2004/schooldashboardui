import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const schools = await prisma.school.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ schools });
}
