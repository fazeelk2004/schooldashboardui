import Link from "next/link";
import { PLAN_DISPLAY, PLAN_FEATURES, PlanKey } from "@/lib/plans";
import PublicHeader from "@/components/PublicHeader";
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
  const features = PLAN_FEATURES[plan];

  return (
    <div className="public-flow min-h-screen overflow-hidden bg-surface-muted text-ink">
      <PublicHeader actionHref="/pricing" actionLabel="Change plan" />

      <main className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 lg:pt-14">
        <div className="public-orb public-orb-one" aria-hidden="true" />
        <div className="public-orb public-orb-two" aria-hidden="true" />

        <div className="relative z-10 mb-9 max-w-2xl">
          <span className="public-eyebrow">School setup · About 3 minutes</span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
            Build your school workspace.
          </h1>
          <p className="mt-4 text-base leading-7 text-ink-muted">
            Tell us about your school and create the administrator account that
            will manage your NeuraLearn workspace.
          </p>
        </div>

        <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-8">
          <aside className="onboarding-plan-card lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand">
                  Selected plan
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.025em]">
                  {display.name}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">{display.tagline}</p>
              </div>
              <span className="rounded-2xl border border-brand/15 bg-brand-soft px-3 py-2 text-sm font-extrabold text-brand">
                {display.priceLabel}
              </span>
            </div>

            <div className="my-6 h-px bg-line/75" />

            <ul className="space-y-3">
              {display.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3 text-sm leading-6 text-ink-muted">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
                  </span>
                  {highlight}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <PlanLimit label="Admins" value={formatLimit(features.maxAdmins)} />
              <PlanLimit label="Teachers" value={formatLimit(features.maxTeachers)} />
              <PlanLimit label="Students" value={formatLimit(features.maxStudents)} />
            </div>

            <Link href="/pricing" className="btn-ghost mt-5 w-full border border-line/70">
              Compare all plans
            </Link>
          </aside>

          <section className="onboarding-form-card">
            <div className="mb-7 flex items-center justify-between border-b border-line/70 pb-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand">
                  Workspace details
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Required fields are marked with an asterisk.
                </p>
              </div>
              <span className="hidden items-center gap-2 text-xs font-bold text-ink-subtle sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129_/_0.1)]" />
                Auto-saved at checkout
              </span>
            </div>
            <OnboardingForm plan={plan} />
          </section>
        </div>
      </main>
    </div>
  );
}

function formatLimit(value: number) {
  return value === Infinity ? "∞" : String(value);
}

function PlanLimit({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/70 bg-surface-muted/65 px-2 py-3 text-center">
      <p className="text-base font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-subtle">{label}</p>
    </div>
  );
}
