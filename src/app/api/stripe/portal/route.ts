import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const schoolId = (sessionClaims?.metadata as { schoolId?: number })?.schoolId;

  if (role !== "admin" || !schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sub = await prisma.subscription.findUnique({
    where: { schoolId },
  });
  if (!sub?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No active subscription found." },
      { status: 404 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${appUrl}/admin/billing`,
  });

  return NextResponse.json({ url: session.url });
}
