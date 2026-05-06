import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPriceIdForPlan, PlanKey } from "@/lib/plans";

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["FREE", "PLUS", "PRO"]),
  schoolDraft: z.object({
    name: z.string().min(2),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    website: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  }),
  adminDraft: z.object({
    username: z.string().min(3).max(40),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { plan, schoolDraft, adminDraft } = parsed.data;

    const existing = await prisma.school.findUnique({
      where: { name: schoolDraft.name },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A school with that name already exists." },
        { status: 409 }
      );
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const pending = await prisma.pendingSignup.create({
      data: {
        plan: plan as PlanKey,
        email: adminDraft.email,
        payload: { schoolDraft, adminDraft } as any,
        expiresAt,
      },
    });

    const priceId = getPriceIdForPlan(plan as PlanKey);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: adminDraft.email,
      success_url: `${appUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        pendingSignupId: pending.id,
        plan,
      },
      subscription_data: {
        metadata: {
          pendingSignupId: pending.id,
          plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/checkout] error", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
