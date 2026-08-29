import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function StudentSignupSuccessPage() {
  return (
    <div className="public-flow min-h-screen overflow-hidden bg-surface-muted text-ink">
      <PublicHeader actionHref="/sign-in" actionLabel="Sign in" />

      <main className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-14">
        <div className="public-orb public-orb-one" aria-hidden="true" />
        <div className="public-orb public-orb-two" aria-hidden="true" />

        <section className="success-card relative z-10 w-full max-w-xl text-center">
          <div className="success-check" aria-hidden="true">
            <svg width="31" height="31" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m5 12 4 4L19 6" />
            </svg>
            <span />
          </div>

          <span className="public-eyebrow mt-7">Application received</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            You&apos;re all set for now.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-muted">
            Your application is safely with the school administrator. They&apos;ll
            review your details, assign your class, and activate your account.
          </p>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {[
              ["1", "Review", "The school checks your details."],
              ["2", "Placement", "Your class is assigned."],
              ["3", "Access", "You can sign in after approval."],
            ].map(([number, title, copy]) => (
              <div key={number} className="rounded-2xl border border-line/70 bg-surface-muted/65 p-4">
                <span className="text-[10px] font-extrabold text-brand">0{number}</span>
                <p className="mt-2 text-sm font-bold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
            <Link href="/" className="btn-ghost border border-line/70 px-5 py-3">
              Back to home
            </Link>
            <Link href="/sign-in" className="btn-primary px-6 py-3">
              Go to sign in
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
