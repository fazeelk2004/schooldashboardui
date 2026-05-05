import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomeThemeToggle from "@/components/HomeThemeToggle";

export default function HomePage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role) {
    redirect(`/${role}`);
  }

  const features = [
    {
      title: "AI Quiz Generator",
      desc: "Turn any document into a quiz in seconds.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      title: "Smart Attendance",
      desc: "Lesson-aware tracking that just works.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M9 16l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Live Schedules",
      desc: "Calendars for students, teachers, parents.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      title: "Role-aware Access",
      desc: "Admins, teachers, students, parents — handled.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-surface-muted text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">
              <Image src="/logo.png" alt="" width={20} height={20} />
            </div>
            <span className="font-semibold tracking-tight">SchooLama</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-ink-muted">
            <a href="#features" className="hover:text-ink transition">Features</a>
            <a href="#roles" className="hover:text-ink transition">Roles</a>
            <a href="#about" className="hover:text-ink transition">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <HomeThemeToggle />
            <Link href="/sign-in" className="btn-primary">
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 text-center">
        <span className="chip mb-6">Modern school management</span>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          The dashboard your school
          <br />
          <span className="text-brand">actually wants to use.</span>
        </h1>
        <p className="mt-6 mx-auto max-w-xl text-base md:text-lg text-ink-muted">
          One clean, fast, role-aware platform for admins, teachers, students,
          and parents. AI-powered. Fully dark-mode native.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link href="/sign-in" className="btn-primary px-6 py-3 text-sm">
            Get started
          </Link>
          <a href="#features" className="btn-ghost px-6 py-3 text-sm">
            Learn more →
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="panel panel-pad">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="panel panel-pad md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Built for every role.
              </h2>
              <p className="mt-3 text-ink-muted">
                Each user lands on a dashboard tailored to what they actually
                need — no clutter, no extra tabs.
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["Admins", "Manage schools, classes, staff, and reports."],
                ["Teachers", "Lessons, attendance, AI quizzes, gradebook."],
                ["Students", "Schedule, results, assignments, quizzes."],
                ["Parents", "Track attendance and progress for each child."],
              ].map(([role, desc]) => (
                <li key={role} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-medium">{role}.</span>{" "}
                    <span className="text-ink-muted">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="mx-auto max-w-6xl px-6 pb-24">
        <div className="panel panel-pad md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Ready to see your dashboard?
          </h2>
          <p className="mt-3 text-ink-muted">
            Sign in to pick up where you left off.
          </p>
          <Link href="/sign-in" className="btn-primary mt-6 px-6 py-3">
            Login
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-subtle">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={16} height={16} />
            <span>SchooLama</span>
          </div>
          <span>© {new Date().getFullYear()} SchooLama. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
