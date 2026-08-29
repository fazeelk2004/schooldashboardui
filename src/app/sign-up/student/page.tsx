import StudentSignupForm from "./StudentSignupForm";
import PublicHeader from "@/components/PublicHeader";

export default function StudentSignupPage() {
  return (
    <div className="public-flow min-h-screen overflow-hidden bg-surface-muted text-ink">
      <PublicHeader actionHref="/sign-in" actionLabel="Sign in" />

      <main className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14 lg:pt-16">
        <div className="public-orb public-orb-one" aria-hidden="true" />
        <div className="public-orb public-orb-two" aria-hidden="true" />

        <aside className="relative z-10 lg:sticky lg:top-32 lg:self-start">
          <span className="public-eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Student admissions
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl lg:text-[3.6rem] lg:leading-[1.02]">
            Your next chapter starts here.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-ink-muted">
            Send one secure application to your school. Once approved, your
            class, learning tools, attendance, and results will be ready in one
            place.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["01", "Choose your school", "Find your school and intended grade."],
              ["02", "Add your details", "Create your student and guardian profile."],
              ["03", "Await approval", "Your school reviews and assigns your class."],
            ].map(([number, title, copy]) => (
              <div key={number} className="public-mini-step">
                <span>{number}</span>
                <div>
                  <p className="text-sm font-bold text-ink">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-ink-muted">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-xs font-semibold text-ink-subtle">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m5 12 4 4L19 6" />
              </svg>
            </span>
            Secure application · Reviewed by your school
          </div>
        </aside>

        <section className="relative z-10 min-w-0">
          <StudentSignupForm />
        </section>
      </main>
    </div>
  );
}
