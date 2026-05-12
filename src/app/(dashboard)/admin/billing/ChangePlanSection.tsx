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
      const res = await fetch("/api/stripe/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error ?? "Could not change plan.");
      }
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      setSuccessPlan(plan);
      setConfirmPlan(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setPendingPlan(null);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost px-6 py-3"
      >
        {open ? "Hide plans" : hasSubscription ? "Change plan" : "Upgrade plan"}
      </button>

      {successPlan && (
        <p className="mt-3 text-sm text-emerald-500">
          Plan updated to {PLAN_DISPLAY[successPlan].name}. Changes may take a
          moment to reflect.
        </p>
      )}

      {open && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLAN_ORDER.map((plan) => {
            const display = PLAN_DISPLAY[plan];
            const isCurrent = plan === currentPlan;
            const isUpgrade = PLAN_RANK[plan] > PLAN_RANK[currentPlan];
            const label = isCurrent
              ? "Current plan"
              : isUpgrade
              ? `Upgrade to ${display.name}`
              : `Downgrade to ${display.name}`;
            const busy = pendingPlan === plan;
            return (
              <div
                key={plan}
                className={`border rounded-lg p-4 flex flex-col ${
                  isCurrent ? "border-brand ring-1 ring-brand" : "border-line"
                }`}
              >
                <div className="text-sm font-semibold">{display.name}</div>
                <div className="text-xs text-ink-muted">
                  {display.priceLabel}
                </div>
                <ul className="mt-3 space-y-1 text-xs text-ink-muted flex-1">
                  {display.highlights.map((h) => (
                    <li key={h}>• {h}</li>
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
                  className={`mt-4 text-sm py-2 rounded-md ${
                    isCurrent
                      ? "bg-surface-muted text-ink-subtle cursor-not-allowed"
                      : isUpgrade
                      ? "btn-primary"
                      : "btn-ghost"
                  } disabled:opacity-60`}
                >
                  {busy ? "Updating…" : label}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="panel panel-pad max-w-md w-full">
            <h2 className="text-lg font-semibold">
              {PLAN_RANK[confirmPlan] > PLAN_RANK[currentPlan]
                ? "Upgrade"
                : "Downgrade"}{" "}
              to {PLAN_DISPLAY[confirmPlan].name}?
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              You&apos;re switching from{" "}
              <span className="font-medium">
                {PLAN_DISPLAY[currentPlan].name}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {PLAN_DISPLAY[confirmPlan].name}
              </span>{" "}
              ({PLAN_DISPLAY[confirmPlan].priceLabel}).{" "}
              {hasSubscription
                ? "Stripe will prorate the charge for the remainder of this billing period."
                : "You'll be redirected to Stripe Checkout to complete payment."}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmPlan(null)}
                disabled={pendingPlan !== null}
                className="btn-ghost px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => submit(confirmPlan)}
                disabled={pendingPlan !== null}
                className="btn-primary px-4 py-2 disabled:opacity-60"
              >
                {pendingPlan === confirmPlan ? "Updating…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
