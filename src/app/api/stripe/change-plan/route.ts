import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPriceIdForPlan, PlanKey } from "@/lib/plans";

export const runtime = "nodejs";

const bodySchema = z.object({
  plan: z.enum(["FREE", "PLUS", "PRO"]),
});

export async function POST(req: NextRequest) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const schoolId = (sessionClaims?.metadata as { schoolId?: number })?.schoolId;

  if (role !== "admin" || !schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  const targetPlan = parsed.data.plan as PlanKey;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, plan: true },
  });
  if (!school) {
    return NextResponse.json({ error: "School not found." }, { status: 404 });
  }

  const sub = await prisma.subscription.findUnique({ where: { schoolId } });
  const effectiveCurrentPlan = (sub?.plan ?? school.plan ?? "FREE") as PlanKey;

  if (effectiveCurrentPlan === targetPlan) {
    return NextResponse.json(
      { error: "You are already on this plan." },
      { status: 400 }
    );
  }

  let newPriceId: string;
  try {
    newPriceId = getPriceIdForPlan(targetPlan);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Plan not configured" },
      { status: 500 }
    );
  }

  if (sub?.stripeSubscriptionId) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(
        sub.stripeSubscriptionId
      );
      const itemId = stripeSub.items.data[0]?.id;
      if (!itemId) {
        return NextResponse.json(
          { error: "Subscription has no items to update." },
          { status: 500 }
        );
      }

      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: "create_prorations",
        cancel_at_period_end: false,
        metadata: { plan: targetPlan },
      });

      return NextResponse.json({ ok: true, plan: targetPlan });
    } catch (err: any) {
      console.error("[stripe/change-plan] price swap error", err);
      return NextResponse.json(
        { error: err?.message ?? "Could not change plan." },
        { status: 500 }
      );
    }
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: newPriceId, quantity: 1 }],
      customer: sub?.stripeCustomerId ?? undefined,
      success_url: `${appUrl}/admin/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/admin/billing`,
      metadata: {
        schoolId: String(schoolId),
        plan: targetPlan,
      },
      subscription_data: {
        metadata: {
          schoolId: String(schoolId),
          plan: targetPlan,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/change-plan] checkout error", err);
    return NextResponse.json(
      { error: err?.message ?? "Could not start checkout." },
      { status: 500 }
    );
  }
}
