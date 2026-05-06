import Image from "next/image";
import Link from "next/link";
import { PLAN_DISPLAY, PlanKey } from "@/lib/plans";
import OnboardingForm from "./OnboardingForm";

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const planParam = (searchParams.plan ?? "FREE").toUpperCase();
  const plan: PlanKey = (["FREE", "PLUS", "PRO"] as const).includes(
    planParam as PlanKey
  )
    ? (planParam as PlanKey)
    : "FREE";
  const display = PLAN_DISPLAY[plan];

  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
              <Image src="/logo.png" alt="" width={20} height={20} />
            </div>
            <span className="font-semibold tracking-tight">NeuraLearn</span>
          </Link>
          <Link href="/pricing" className="btn-ghost text-sm">
            Change plan
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-12 pb-24">
        <div className="panel panel-pad">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Create your school</h1>
              <p className="text-sm text-ink-muted mt-1">
                Selected plan:{" "}
                <span className="font-medium">{display.name}</span> —{" "}
                {display.priceLabel}
              </p>
            </div>
          </div>

          <OnboardingForm plan={plan} />
        </div>
      </section>
    </div>
  );
}
