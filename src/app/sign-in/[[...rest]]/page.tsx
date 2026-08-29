"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HomeThemeToggle from "@/components/HomeThemeToggle";

export default function LoginPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) router.push(`/${role}`);
  }, [user, router]);

  return (
    <main className="auth-shell min-h-screen bg-surface-muted text-ink">
      <section className="auth-story-panel">
        <div className="auth-story-grid" aria-hidden="true" />
        <div className="auth-story-orb auth-story-orb-one" aria-hidden="true" />
        <div className="auth-story-orb auth-story-orb-two" aria-hidden="true" />

        <Link href="/" className="relative z-10 flex items-center gap-3" aria-label="NeuraLearn home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm">
            <Image src="/logo.png" alt="" width={23} height={23} />
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-[-0.02em] text-white">NeuraLearn</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/55">School intelligence</span>
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgb(110_231_183_/_0.12)]" />
            Your learning command center
          </span>
          <h1 className="mt-7 text-4xl font-extrabold leading-[1.05] tracking-[-0.05em] text-white lg:text-6xl">
            One place for every school day.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/68">
            Stay connected to classes, attendance, quizzes, results, and the
            people who make learning happen.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["Live", "Attendance"],
              ["Smart", "Assessments"],
              ["Clear", "Insights"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4 backdrop-blur-sm">
                <p className="text-sm font-extrabold text-white">{value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/48">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs font-medium text-white/45">
          Secure access for administrators, teachers, students, and parents.
        </p>
      </section>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16 sm:px-8">
        <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-7">
          <HomeThemeToggle />
        </div>
        <div className="public-orb public-orb-two" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-md">
          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-2 text-xs font-bold text-ink-muted transition hover:-translate-x-1 hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            Back to home
          </Link>

          <SignIn.Root>
            <SignIn.Step name="start" className="auth-form-card">
              <div className="mb-2 lg:hidden">
                <span className="public-brand-mark">
                  <Image src="/logo.png" alt="" width={22} height={22} />
                </span>
              </div>

              <div>
                <span className="public-eyebrow">Secure sign in</span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em]">
                  Welcome back.
                </h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Enter your credentials to open your NeuraLearn dashboard.
                </p>
              </div>

              <Clerk.GlobalError className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-3 text-xs font-semibold text-rose-600 dark:text-rose-300" />

              <Clerk.Field name="identifier" className="modern-public-field">
                <Clerk.Label>Username</Clerk.Label>
                <span className="auth-input-wrap">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>
                  <Clerk.Input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Enter your username"
                    className="input-base pl-11"
                  />
                </span>
                <Clerk.FieldError className="text-xs font-semibold text-rose-500" />
              </Clerk.Field>

              <Clerk.Field name="password" className="modern-public-field">
                <Clerk.Label>Password</Clerk.Label>
                <span className="auth-input-wrap">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
                  <Clerk.Input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="input-base pl-11"
                  />
                </span>
                <Clerk.FieldError className="text-xs font-semibold text-rose-500" />
              </Clerk.Field>

              <SignIn.Action submit className="btn-primary mt-1 w-full py-3.5">
                Sign in to NeuraLearn
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </SignIn.Action>

              <div className="flex items-center gap-3 py-1">
                <span className="h-px flex-1 bg-line" />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-subtle">New student?</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <Link href="/sign-up/student" className="btn-ghost w-full border border-line/70 py-3">
                Apply to join your school
              </Link>
            </SignIn.Step>
          </SignIn.Root>

          <p className="mt-6 text-center text-[11px] leading-5 text-ink-subtle">
            By continuing, you agree to use this workspace in accordance with
            your school&apos;s policies.
          </p>
        </div>
      </section>
    </main>
  );
}
