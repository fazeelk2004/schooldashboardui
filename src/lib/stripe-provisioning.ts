import type Stripe from "stripe";
import prisma from "./prisma";
import { stripe } from "./stripe";
import { planFromPriceId, PlanKey } from "./plans";

export const attachSubscriptionToExistingSchool = async (
  session: Stripe.Checkout.Session
): Promise<boolean> => {
  const schoolIdStr = session.metadata?.schoolId;
  if (!schoolIdStr) return false;
  const schoolId = Number(schoolIdStr);
  if (!Number.isFinite(schoolId)) return false;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  let stripeSub: Stripe.Subscription | null = null;
  if (subscriptionId) {
    stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
  }
  const firstItem = stripeSub?.items.data[0];
  const priceId = firstItem?.price.id ?? null;
  const plan = (planFromPriceId(priceId) ??
    (session.metadata?.plan as PlanKey | undefined) ??
    "FREE") as PlanKey;
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
        status: (stripeSub?.status?.toUpperCase() ?? "ACTIVE") as any,
        stripeCustomerId: customerId ?? null,
        stripeSubscriptionId: subscriptionId ?? null,
        stripePriceId: priceId,
        currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
        cancelAtPeriodEnd: stripeSub?.cancel_at_period_end ?? false,
      },
      update: {
        plan,
        status: (stripeSub?.status?.toUpperCase() ?? "ACTIVE") as any,
        stripeCustomerId: customerId ?? null,
        stripeSubscriptionId: subscriptionId ?? null,
        stripePriceId: priceId,
        currentPeriodEnd: periodEndUnix ? new Date(periodEndUnix * 1000) : null,
        cancelAtPeriodEnd: stripeSub?.cancel_at_period_end ?? false,
      },
    });

    await tx.school.update({
      where: { id: schoolId },
      data: { plan: plan as any },
    });
  });

  return true;
};

export const reconcileSubscriptionFromStripe = async (
  schoolId: number
): Promise<void> => {
  const sub = await prisma.subscription.findUnique({ where: { schoolId } });
  if (!sub?.stripeSubscriptionId) return;

  const stripeSub = await stripe.subscriptions.retrieve(
    sub.stripeSubscriptionId
  );
  const firstItem = stripeSub.items.data[0];
  const priceId = firstItem?.price.id ?? null;
  const plan = planFromPriceId(priceId) ?? (sub.plan as PlanKey);
  const periodEndUnix =
    (firstItem as any)?.current_period_end ??
    (stripeSub as any)?.current_period_end ??
    null;

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { schoolId },
      data: {
        plan,
        status: stripeSub.status.toUpperCase() as any,
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
};
