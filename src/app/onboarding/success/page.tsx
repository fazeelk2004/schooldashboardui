import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import SuccessPoller from "./SuccessPoller";

export default function OnboardingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  return (
    <div className="public-flow min-h-screen overflow-hidden bg-surface-muted text-ink">
      <PublicHeader actionHref="/" actionLabel="Back home" />

      <main className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-14">
        <div className="public-orb public-orb-one" aria-hidden="true" />
        <div className="public-orb public-orb-two" aria-hidden="true" />

        <section className="success-card relative z-10 w-full max-w-lg text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/15 bg-brand-soft text-brand">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8h16M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" /><path d="m9 14 2 2 4-4" /></svg>
          </span>
          <span className="public-eyebrow mt-6">Payment confirmed</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            Welcome to NeuraLearn.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-muted">
            Your subscription is active. We&apos;re preparing the final pieces of
            your school workspace now.
          </p>

          {sessionId ? (
            <SuccessPoller sessionId={sessionId} />
          ) : (
            <div className="mt-7">
              <Link href="/sign-in" className="btn-primary px-7 py-3">
                Go to sign in
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
