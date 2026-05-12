import Image from "next/image";
import Link from "next/link";
import StudentSignupForm from "./StudentSignupForm";
import HomeThemeToggle from "@/components/HomeThemeToggle";

export default function StudentSignupPage() {
  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
              <Image src="/logo.png" alt="" width={20} height={20} />
            </div>
            <span className="font-semibold tracking-tight">NeuraLearn</span>
          </Link>
          <div className="flex items-center gap-3">
            <HomeThemeToggle />
            <Link href="/sign-in" className="btn-ghost text-sm">
              I already have an account
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pt-12 pb-24">
        <div className="mb-8 text-center">
          <span className="chip mb-4">Student application</span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Apply to join your school.
          </h1>
          <p className="mt-3 text-ink-muted">
            Fill in your details — an admin will review your application and
            assign you to a class.
          </p>
        </div>

        <StudentSignupForm />
      </section>
    </div>
  );
}
