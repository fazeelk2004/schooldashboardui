import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { planFromPriceId, PlanKey } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const schoolId = (sessionClaims?.metadata as { schoolId?: number })?.schoolId;

  if (role !== "admin" || !schoolId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const search = await stripe.subscriptions.search({
      query: `metadata['schoolId']:'${schoolId}' AND status:'active'`,
      limit: 1,
    });
    const stripeSub = search.data[0];
    if (!stripeSub) {
      return NextResponse.json(
        { error: "No active Stripe subscription found for this school." },
        { status: 404 }
      );
    }

    const firstItem = stripeSub.items.data[0];
    const priceId = firstItem?.price.id ?? null;
    const plan = (planFromPriceId(priceId) ??
      (stripeSub.metadata?.plan as PlanKey | undefined) ??
      "FREE") as PlanKey;
    const customerId =
      typeof stripeSub.customer === "string"
        ? stripeSub.customer
        : stripeSub.customer?.id ?? null;
    const periodEndUnix =
      (firstItem as any)?.current_period_end ??
      (stripeSub as any)?.current_period_end ??
      null;

    await prisma.$transaction(async (tx) => {
      await tx.subscription.upsert({
        where: { schoolId },
        create: {
          schoolId,
          plan,
          status: stripeSub.status.toUpperCase() as any,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: priceId,
          currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        },
        update: {
          plan,
          status: stripeSub.status.toUpperCase() as any,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          stripePriceId: priceId,
          currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
          cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        },
      });
      await tx.school.update({
        where: { id: schoolId },
        data: { plan: plan as any },
      });
    });

    return NextResponse.json({ ok: true, plan });
  } catch (err: any) {
    console.error("[stripe/sync] error", err);
    return NextResponse.json(
      { error: err?.message ?? "Sync failed." },
      { status: 500 }
    );
  }
}
