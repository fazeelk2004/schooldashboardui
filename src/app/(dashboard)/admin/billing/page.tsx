import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { PLAN_DISPLAY, PLAN_FEATURES, PlanKey } from "@/lib/plans";
import { stripe } from "@/lib/stripe";
import { attachSubscriptionToExistingSchool } from "@/lib/stripe-provisioning";
import BillingPortalButton from "./BillingPortalButton";
import ChangePlanSection from "./ChangePlanSection";
import SyncFromStripeButton from "./SyncFromStripeButton";

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const schoolId = (sessionClaims?.metadata as { schoolId?: number })?.schoolId;

  if (role !== "admin" || !schoolId) {
    redirect("/sign-in");
  }

  if (searchParams?.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        searchParams.session_id
      );
      if (
        session.metadata?.schoolId &&
        Number(session.metadata.schoolId) === schoolId
      ) {
        await attachSubscriptionToExistingSchool(session);
      }
    } catch (err) {
      console.error("[admin/billing] session reconcile failed", err);
    }
    redirect("/admin/billing");
  }

  const sub = await prisma.subscription.findUnique({
    where: { schoolId: schoolId! },
    include: { school: { select: { name: true, plan: true } } },
  });

  const plan = (sub?.plan ?? sub?.school.plan ?? "FREE") as PlanKey;
  const display = PLAN_DISPLAY[plan];
  const features = PLAN_FEATURES[plan];

  return (
    <div className="p-6">
      <div className="panel panel-pad max-w-2xl">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage your subscription, update payment method, or cancel.
        </p>

        <div className="mt-6 border border-line rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-subtle uppercase tracking-wide">
                Current plan
              </div>
              <div className="text-xl font-semibold mt-1">{display.name}</div>
              <div className="text-sm text-ink-muted">{display.priceLabel}</div>
            </div>
            <div className="text-right text-xs text-ink-subtle">
              {sub?.status && <div>Status: {sub.status}</div>}
              {sub?.currentPeriodEnd && (
                <div>
                  Renews{" "}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
              {sub?.cancelAtPeriodEnd && (
                <div className="text-amber-500">Cancels at period end</div>
              )}
            </div>
          </div>

          <ul className="mt-4 space-y-1 text-sm text-ink-muted">
            <li>
              {features.maxAdmins === Infinity ? "∞" : features.maxAdmins} admin(s)
            </li>
            <li>
              {features.maxTeachers === Infinity ? "∞" : features.maxTeachers}{" "}
              teacher(s)
            </li>
            <li>
              {features.maxStudents === Infinity ? "∞" : features.maxStudents}{" "}
              student(s)
            </li>
            <li>AI Quiz generation: {features.aiQuiz ? "Yes" : "No"}</li>
            <li>Quizzes: {features.quizzes ? "Yes" : "No"}</li>
            <li>Exams: {features.exams ? "Yes" : "No"}</li>
          </ul>
        </div>

        <div className="mt-6">
          <BillingPortalButton hasSubscription={!!sub?.stripeCustomerId} />
        </div>

        <ChangePlanSection
          currentPlan={plan}
          hasSubscription={!!sub?.stripeSubscriptionId}
        />

        <SyncFromStripeButton />
      </div>
    </div>
  );
}
