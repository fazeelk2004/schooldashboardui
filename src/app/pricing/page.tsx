import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import { PLAN_DISPLAY, PLAN_FEATURES, PlanKey } from "@/lib/plans";

const PLAN_ORDER: PlanKey[] = ["FREE", "PLUS", "PRO"];

const PLAN_META: Record<
  PlanKey,
  { eyebrow: string; cta: string; icon: React.ReactNode }
> = {
  FREE: {
    eyebrow: "Start simple",
    cta: "Start free",
    icon: <SparkIcon />,
  },
  PLUS: {
    eyebrow: "Most popular",
    cta: "Choose Plus",
    icon: <BoltIcon />,
  },
  PRO: {
    eyebrow: "Maximum scale",
    cta: "Choose Pro",
    icon: <CrownIcon />,
  },
};

export default function PricingPage() {
  return (
    <div className="public-flow min-h-screen overflow-hidden bg-surface-muted text-ink">
      <PublicHeader actionHref="/sign-in" actionLabel="Sign in" />

      <main className="relative">
        <div className="public-orb public-orb-one" aria-hidden="true" />
        <div className="public-orb public-orb-two" aria-hidden="true" />

        <section className="relative z-10 mx-auto max-w-4xl px-5 pb-12 pt-16 text-center sm:px-8 sm:pt-20">
          <span className="public-eyebrow">Simple monthly pricing</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl sm:leading-[1.02]">
            Choose room to grow.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-muted">
            Start with the essentials, then unlock richer assessment and
            analytics tools as your school expands. No complicated contracts.
          </p>

          <div className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-line/75 bg-surface/75 px-4 py-2 text-xs font-bold text-ink-muted shadow-sm backdrop-blur-xl">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
            </span>
            Monthly billing · Upgrade or cancel anytime
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
            {PLAN_ORDER.map((plan, index) => {
              const display = PLAN_DISPLAY[plan];
              const features = PLAN_FEATURES[plan];
              const meta = PLAN_META[plan];
              const isPopular = plan === "PLUS";

              return (
                <article
                  key={plan}
                  className={`pricing-card ${isPopular ? "is-popular" : ""}`}
                  style={{ animationDelay: `${index * 90}ms` }}
                  >
                    {isPopular && (
                      <div className="pricing-popular-bar">Recommended for growing schools</div>
                    )}

                  <div className="flex items-start justify-between gap-4">
                    <span className={`pricing-plan-icon pricing-plan-icon-${plan.toLowerCase()}`}>
                      {meta.icon}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand">
                      {meta.eyebrow}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-2xl font-extrabold tracking-[-0.025em]">{display.name}</h2>
                    <p className="mt-1.5 min-h-10 text-sm leading-5 text-ink-muted">{display.tagline}</p>
                  </div>

                  <div className="mt-6 flex items-end gap-1.5">
                    <span className="text-4xl font-extrabold tracking-[-0.045em]">{priceAmount(display.priceLabel)}</span>
                    <span className="pb-1.5 text-sm font-semibold text-ink-subtle">/ month</span>
                  </div>

                  <Link
                    href={`/onboarding?plan=${plan}`}
                    className={`${isPopular ? "btn-primary" : "btn-ghost border border-line/80 bg-surface-muted/60"} mt-6 w-full py-3.5`}
                  >
                    {meta.cta}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </Link>

                  <div className="my-6 h-px bg-line/75" />

                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-subtle">
                    Everything you need
                  </p>
                  <ul className="mt-4 flex-1 space-y-3">
                    {display.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-3 text-sm leading-5 text-ink-muted">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <Limit value={formatLimit(features.maxAdmins)} label="Admins" />
                    <Limit value={formatLimit(features.maxTeachers)} label="Teachers" />
                    <Limit value={formatLimit(features.maxStudents)} label="Students" />
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pricing-trust-row">
            {[
              [<ShieldIcon key="shield" />, "Secure Stripe checkout"],
              [<RefreshIcon key="refresh" />, "Change plans anytime"],
              [<SupportIcon key="support" />, "Support when you need it"],
            ].map(([icon, label]) => (
              <div key={String(label)} className="flex items-center justify-center gap-2.5 text-xs font-bold text-ink-muted">
                <span className="text-brand">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function priceAmount(label: string) {
  return label.replace("/mo", "");
}

function formatLimit(value: number) {
  return value === Infinity ? "∞" : String(value);
}

function Limit({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-surface-muted/80 px-2 py-3 text-center ring-1 ring-inset ring-line/60">
      <p className="text-base font-extrabold">{value}</p>
      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-ink-subtle">{label}</p>
    </div>
  );
}

function SparkIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></svg>;
}

function BoltIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" /></svg>;
}

function CrownIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Z" /><path d="M5 18h14" /></svg>;
}

function ShieldIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 5 6v5c0 4.7 2.9 8.3 7 10 4.1-1.7 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function RefreshIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-5V2M4 17h5v5M19 7a8 8 0 0 0-13.7-2.7L4 6M5 17a8 8 0 0 0 13.7 2.7L20 18" /></svg>;
}

function SupportIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 13a8 8 0 0 1 16 0M4 13v4a2 2 0 0 0 2 2h1v-7H4v1ZM20 13v4a2 2 0 0 1-2 2h-1v-7h3v1ZM17 19c0 1.1-.9 2-2 2h-3" /></svg>;
}
