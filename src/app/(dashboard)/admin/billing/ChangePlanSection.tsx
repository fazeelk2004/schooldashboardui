"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_DISPLAY, PlanKey } from "@/lib/plans-shared";

const PLAN_ORDER: PlanKey[] = ["FREE", "PLUS", "PRO"];
const PLAN_RANK: Record<PlanKey, number> = { FREE: 0, PLUS: 1, PRO: 2 };

export default function ChangePlanSection({
  currentPlan,
  hasSubscription,
}: {
  currentPlan: PlanKey;
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<PlanKey | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<PlanKey | null>(null);

  const submit = async (plan: PlanKey) => {
    setError(null);
    setPendingPlan(plan);
    try {
      const response = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(json.error ?? "Could not change plan.");
      if (json.url) {
        window.location.href = json.url;
        return;
      }

      setSuccessPlan(plan);
      setConfirmPlan(null);
      router.refresh();
    } catch (planError: unknown) {
      setError(planError instanceof Error ? planError.message : "Something went wrong.");
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <section className="billing-change-panel">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="dashboard-section-kicker">Plan options</span>
          <h2 className="mt-3 text-xl font-extrabold tracking-[-0.025em]">
            Find the right fit for your school
          </h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Compare capacity and tools before making a change.
          </p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="btn-ghost shrink-0 border border-line/80 px-5 py-3"
        >
          {open ? "Hide plan options" : hasSubscription ? "Change plan" : "Explore upgrades"}
          <svg className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </div>

      {successPlan && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 4 4L19 6" /></svg>
          Plan updated to {PLAN_DISPLAY[successPlan].name}. Changes may take a moment to appear.
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {open && (
        <div className="billing-plan-grid mt-6 grid gap-4 lg:grid-cols-3">
          {PLAN_ORDER.map((plan) => {
            const display = PLAN_DISPLAY[plan];
            const isCurrent = plan === currentPlan;
            const isUpgrade = PLAN_RANK[plan] > PLAN_RANK[currentPlan];
            const busy = pendingPlan === plan;
            const label = isCurrent
              ? "Current plan"
              : isUpgrade
                ? `Upgrade to ${display.name}`
                : `Downgrade to ${display.name}`;

            return (
              <article key={plan} className={`billing-option-card ${isCurrent ? "is-current" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold tracking-[-0.02em]">{display.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">{display.tagline}</p>
                  </div>
                  {isCurrent && <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-brand">Active</span>}
                </div>

                <p className="mt-5 text-2xl font-extrabold tracking-[-0.035em]">{display.priceLabel}</p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {display.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-start gap-2 text-xs leading-5 text-ink-muted">
                      <svg className="mt-1 shrink-0 text-emerald-500" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
                      {highlight}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={isCurrent || busy}
                  onClick={() => {
                    setError(null);
                    setSuccessPlan(null);
                    setConfirmPlan(plan);
                  }}
                  className={`${isCurrent ? "btn-ghost bg-surface-muted text-ink-subtle" : isUpgrade ? "btn-primary" : "btn-ghost border border-line/80"} mt-6 w-full py-3 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {busy ? "Updating…" : label}
                </button>
              </article>
            );
          })}
        </div>
      )}

      {confirmPlan && (
        <div className="form-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="change-plan-title" className="form-modal-panel w-full max-w-md rounded-[24px] border border-line bg-surface p-6 shadow-2xl sm:p-7">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" /></svg>
            </span>
            <div className="mt-5 text-center">
              <span className="dashboard-section-kicker">
                {PLAN_RANK[confirmPlan] > PLAN_RANK[currentPlan] ? "Plan upgrade" : "Plan change"}
              </span>
              <h2 id="change-plan-title" className="mt-3 text-xl font-extrabold tracking-[-0.025em]">
                Switch to {PLAN_DISPLAY[confirmPlan].name}?
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                You&apos;re moving from <strong className="text-ink">{PLAN_DISPLAY[currentPlan].name}</strong> to{" "}
                <strong className="text-ink">{PLAN_DISPLAY[confirmPlan].name}</strong> at {PLAN_DISPLAY[confirmPlan].priceLabel}.{" "}
                {hasSubscription
                  ? "Stripe will prorate the change for this billing period."
                  : "Stripe Checkout will open to complete payment."}
              </p>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                disabled={pendingPlan !== null}
                className="btn-ghost border border-line/80 py-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submit(confirmPlan)}
                disabled={pendingPlan !== null}
                className="btn-primary py-3 disabled:cursor-wait disabled:opacity-60"
              >
                {pendingPlan === confirmPlan ? "Updating…" : "Confirm change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
