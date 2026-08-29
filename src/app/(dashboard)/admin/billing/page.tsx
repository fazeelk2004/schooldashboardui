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

  if (role !== "admin" || !schoolId) redirect("/sign-in");

  if (searchParams?.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      if (
        session.metadata?.schoolId &&
        Number(session.metadata.schoolId) === schoolId
      ) {
        await attachSubscriptionToExistingSchool(session);
      }
    } catch (error) {
      console.error("[admin/billing] session reconcile failed", error);
    }
    redirect("/admin/billing");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { schoolId: schoolId! },
    include: { school: { select: { name: true, plan: true } } },
  });

  const plan = (subscription?.plan ?? subscription?.school.plan ?? "FREE") as PlanKey;
  const display = PLAN_DISPLAY[plan];
  const features = PLAN_FEATURES[plan];
  const statusLabel = subscription?.status
    ? subscription.status.replaceAll("_", " ")
    : plan === "FREE"
      ? "Free plan"
      : "Active";

  return (
    <div className="dashboard-page space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="billing-hero relative overflow-hidden rounded-[26px] border border-line/70 p-6 sm:p-8">
        <div className="dashboard-welcome-grid absolute inset-0" />
        <div className="dashboard-welcome-orb absolute -right-20 -top-24 h-64 w-64 rounded-full" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="dashboard-section-kicker">Plans & billing</span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
              Subscription control center
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted sm:text-base">
              Manage the plan, payment details, and capacity for {subscription?.school.name ?? "your school"}.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {statusLabel}
          </span>
        </div>
      </section>

      <div className="grid items-stretch gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="billing-plan-panel">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="billing-plan-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" /></svg>
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-ink-subtle">Current plan</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.025em]">{display.name}</h2>
                <p className="mt-1 text-sm text-ink-muted">{display.tagline}</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-extrabold tracking-[-0.04em]">{display.priceLabel.replace("/mo", "")}</p>
              <p className="text-xs font-semibold text-ink-subtle">per month</p>
            </div>
          </div>

          <div className="my-6 h-px bg-line/75" />

          <div className="grid gap-3 sm:grid-cols-3">
            <CapacityCard label="Administrators" value={formatLimit(features.maxAdmins)} icon={<AdminIcon />} />
            <CapacityCard label="Teachers" value={formatLimit(features.maxTeachers)} icon={<TeacherIcon />} />
            <CapacityCard label="Students" value={formatLimit(features.maxStudents)} icon={<StudentIcon />} />
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <FeaturePill enabled={features.attendance} label="Attendance" />
            <FeaturePill enabled={features.quizzes} label="Quizzes" />
            <FeaturePill enabled={features.aiQuiz} label="AI quiz generation" />
            <FeaturePill enabled={features.exams} label="Exams & results" />
            <FeaturePill enabled={features.financeChart} label="Finance analytics" />
            <FeaturePill enabled={features.notifications} label="Notifications" />
          </div>
        </section>

        <section className="billing-details-panel">
          <div>
            <span className="dashboard-section-kicker">Subscription details</span>
            <h2 className="mt-3 text-xl font-extrabold tracking-[-0.025em]">Billing overview</h2>
          </div>

          <dl className="mt-6 divide-y divide-line/70">
            <DetailRow label="Plan" value={display.name} />
            <DetailRow label="Status" value={statusLabel} capitalize />
            <DetailRow
              label={subscription?.cancelAtPeriodEnd ? "Access until" : "Next renewal"}
              value={
                subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : plan === "FREE"
                    ? "No renewal"
                    : "Not available"
              }
            />
          </dl>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs leading-5 text-amber-700 dark:text-amber-300">
              This plan is scheduled to end after the current billing period.
            </div>
          )}

          <div className="mt-6 border-t border-line/70 pt-6">
            <BillingPortalButton hasSubscription={!!subscription?.stripeCustomerId} />
            <SyncFromStripeButton />
          </div>
        </section>
      </div>

      <ChangePlanSection
        currentPlan={plan}
        hasSubscription={!!subscription?.stripeSubscriptionId}
      />
    </div>
  );
}

function formatLimit(value: number) {
  return value === Infinity ? "Unlimited" : String(value);
}

function CapacityCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="billing-capacity-card">
      <span className="text-brand">{icon}</span>
      <p className="mt-4 text-xl font-extrabold tracking-[-0.025em]">{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink-subtle">{label}</p>
    </div>
  );
}

function FeaturePill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className={`billing-feature-pill ${enabled ? "is-enabled" : ""}`}>
      {enabled ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 7 10 10M17 7 7 17" /></svg>
      )}
      {label}
    </div>
  );
}

function DetailRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
      <dt className="font-medium text-ink-muted">{label}</dt>
      <dd className={`font-bold text-ink ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}

function AdminIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 5 6v5c0 4.7 2.9 8.3 7 10 4.1-1.7 7-5.3 7-10V6l-7-3Z" /></svg>;
}

function TeacherIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 4h5v12h-5M18 8h3" /></svg>;
}

function StudentIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 12v4c2.8 2.5 7.2 2.5 10 0v-4M21 9v6" /></svg>;
}
