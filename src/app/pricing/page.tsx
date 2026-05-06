import Image from "next/image";
import Link from "next/link";
import { PLAN_DISPLAY, PLAN_FEATURES, PlanKey } from "@/lib/plans";

const PLAN_ORDER: PlanKey[] = ["FREE", "PLUS", "PRO"];

export default function PricingPage() {
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
          <Link href="/sign-in" className="btn-ghost text-sm">
            Login
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center">
        <span className="chip mb-6">Pricing</span>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          Pick a plan to launch your school.
        </h1>
        <p className="mt-4 mx-auto max-w-xl text-ink-muted">
          Monthly billing. Cancel any time. Upgrade as your school grows.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_ORDER.map((plan) => {
            const display = PLAN_DISPLAY[plan];
            const features = PLAN_FEATURES[plan];
            const isPopular = plan === "PLUS";
            return (
              <div
                key={plan}
                className={`panel panel-pad flex flex-col ${
                  isPopular ? "ring-2 ring-brand" : ""
                }`}
              >
                {isPopular && (
                  <span className="chip self-start mb-3 bg-brand-soft text-brand">
                    Most popular
                  </span>
                )}
                <h2 className="text-xl font-semibold">{display.name}</h2>
                <p className="text-sm text-ink-muted mt-1">{display.tagline}</p>
                <div className="mt-4 text-3xl font-semibold tracking-tight">
                  {display.priceLabel}
                </div>

                <ul className="mt-6 space-y-2 text-sm flex-1">
                  {display.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 text-xs text-ink-subtle">
                  <div>Up to {features.maxAdmins === Infinity ? "∞" : features.maxAdmins} admin(s)</div>
                  <div>Up to {features.maxTeachers === Infinity ? "∞" : features.maxTeachers} teacher(s)</div>
                  <div>Up to {features.maxStudents === Infinity ? "∞" : features.maxStudents} student(s)</div>
                </div>

                <Link
                  href={`/onboarding?plan=${plan}`}
                  className={`mt-6 ${isPopular ? "btn-primary" : "btn-ghost"} text-center py-3`}
                >
                  {plan === "FREE" ? "Start free" : `Choose ${display.name}`}
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
