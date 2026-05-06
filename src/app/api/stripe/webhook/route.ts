import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { clerkClient } from "@clerk/nextjs/server";
import { planFromPriceId, PlanKey } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SchoolDraft = {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  description?: string | null;
};
type AdminDraft = {
  username: string;
  email: string;
  password: string;
};

const provisionFromSession = async (session: Stripe.Checkout.Session) => {
  const pendingId = session.metadata?.pendingSignupId;
  if (!pendingId) {
    console.warn("[webhook] checkout.session.completed missing pendingSignupId");
    return;
  }

  const pending = await prisma.pendingSignup.findUnique({
    where: { id: pendingId },
  });
  if (!pending) {
    return;
  }

  const payload = pending.payload as unknown as {
    schoolDraft: SchoolDraft;
    adminDraft: AdminDraft;
  };

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
  const priceId = stripeSub?.items.data[0]?.price.id ?? null;
  const plan = (planFromPriceId(priceId) ?? pending.plan) as PlanKey;

  if (subscriptionId) {
    const dup = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });
    if (dup) {
      await prisma.pendingSignup.delete({ where: { id: pending.id } }).catch(() => {});
      return;
    }
  }

  const clerkUser = await clerkClient().users.createUser({
    username: payload.adminDraft.username,
    password: payload.adminDraft.password,
    emailAddress: [payload.adminDraft.email],
    publicMetadata: { role: "admin" },
  });

  try {
    const school = await prisma.$transaction(async (tx) => {
      const created = await tx.school.create({
        data: {
          name: payload.schoolDraft.name,
          address: payload.schoolDraft.address ?? null,
          phone: payload.schoolDraft.phone ?? null,
          email: payload.schoolDraft.email ?? null,
          website: payload.schoolDraft.website ?? null,
          description: payload.schoolDraft.description ?? null,
          plan,
        },
      });

      await tx.admin.create({
        data: {
          id: clerkUser.id,
          username: payload.adminDraft.username,
          schoolId: created.id,
        },
      });

      await tx.subscription.create({
        data: {
          schoolId: created.id,
          plan,
          status: (stripeSub?.status?.toUpperCase() ?? "ACTIVE") as any,
          stripeCustomerId: customerId ?? null,
          stripeSubscriptionId: subscriptionId ?? null,
          stripePriceId: priceId,
          currentPeriodEnd: stripeSub?.current_period_end
            ? new Date(stripeSub.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd: stripeSub?.cancel_at_period_end ?? false,
        },
      });

      await tx.pendingSignup.delete({ where: { id: pending.id } });
      return created;
    });

    await clerkClient().users.updateUser(clerkUser.id, {
      publicMetadata: { role: "admin", schoolId: school.id },
    });
  } catch (err) {
    console.error("[webhook] provisioning failed, rolling back Clerk user", err);
    await clerkClient().users.deleteUser(clerkUser.id).catch(() => {});
    throw err;
  }
};

const updateSubscriptionRecord = async (sub: Stripe.Subscription) => {
  const priceId = sub.items.data[0]?.price.id ?? null;
  const plan = planFromPriceId(priceId);
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
  });
  if (!existing) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status: sub.status.toUpperCase() as any,
      stripePriceId: priceId,
      plan: (plan ?? existing.plan) as any,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });

  if (plan) {
    await prisma.school.update({
      where: { id: existing.schoolId },
      data: { plan: plan as any },
    });
  }
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.error("[webhook] signature verification failed", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await provisionFromSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await updateSubscriptionRecord(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (subId) {
          await prisma.subscription
            .update({
              where: { stripeSubscriptionId: subId },
              data: { status: "PAST_DUE" },
            })
            .catch(() => {});
        }
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[webhook] handler error", err);
    return NextResponse.json(
      { error: err?.message ?? "Webhook handler failed" },
      { status: 500 }
    );
  }
}
