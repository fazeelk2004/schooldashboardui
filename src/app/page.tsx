import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import HomeThemeToggle from "@/components/HomeThemeToggle";

type IconName =
  | "sparkles"
  | "attendance"
  | "calendar"
  | "people"
  | "chart"
  | "shield"
  | "check"
  | "arrow";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    sparkles: (
      <>
        <path d="m12 3-1.1 3.4a6.4 6.4 0 0 1-4.1 4.1L3.5 11.6l3.3 1.1a6.4 6.4 0 0 1 4.1 4.1L12 20.2l1.1-3.4a6.4 6.4 0 0 1 4.1-4.1l3.3-1.1-3.3-1.1a6.4 6.4 0 0 1-4.1-4.1L12 3Z" />
        <path d="m19 3-.35 1.05a2 2 0 0 1-1.27 1.27L16.3 5.7l1.08.36a2 2 0 0 1 1.27 1.27L19 8.4l.36-1.07a2 2 0 0 1 1.27-1.27l1.07-.36-1.07-.38a2 2 0 0 1-1.27-1.27L19 3Z" />
      </>
    ),
    attendance: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="3" />
        <path d="M8 2.5v4M16 2.5v4M3 9h18M8.5 14.5l2 2 4.5-4.5" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4.5" width="18" height="16" rx="3" />
        <path d="M8 2.5v4M16 2.5v4M3 9h18M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" />
      </>
    ),
    people: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V2" />
        <path d="M2 19h22" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const features: { icon: IconName; eyebrow: string; title: string; description: string }[] = [
  {
    icon: "sparkles",
    eyebrow: "AI-powered",
    title: "From lesson material to quiz in moments.",
    description:
      "Upload course content, generate thoughtful questions, and assign them without rebuilding your workflow.",
  },
  {
    icon: "attendance",
    eyebrow: "Effortless records",
    title: "Attendance that stays out of the way.",
    description:
      "Mark a class in seconds, spot patterns early, and keep every record connected to the right lesson.",
  },
  {
    icon: "chart",
    eyebrow: "Clear insight",
    title: "See the whole school, without the noise.",
    description:
      "Turn results, enrollment, and attendance into focused dashboards that make the next action obvious.",
  },
];

const roleCards = [
  { label: "Administrators", detail: "Operations, people, and reporting in one view", accent: "violet" },
  { label: "Teachers", detail: "Classes, attendance, quizzes, and results", accent: "blue" },
  { label: "Students", detail: "Schedules, assignments, and progress", accent: "amber" },
  { label: "Parents", detail: "A simple window into every child’s journey", accent: "green" },
];

export default function HomePage() {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role) redirect(`/${role}`);

  return (
    <main className="neura-landing min-h-screen overflow-hidden bg-surface-muted text-ink">
      <header className="landing-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="NeuraLearn home">
            <span className="logo-shell relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl">
              <span className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/5" />
              <Image className="relative transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" src="/logo.png" alt="" width={25} height={25} priority />
            </span>
            <span className="text-[17px] font-bold tracking-[-0.035em]">NeuraLearn</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 rounded-full border border-line/70 bg-surface/60 p-1 text-sm font-medium text-ink-muted shadow-sm backdrop-blur-xl lg:flex">
            <a href="#platform" className="rounded-full px-4 py-2 transition-colors hover:bg-surface hover:text-ink">Platform</a>
            <a href="#experience" className="rounded-full px-4 py-2 transition-colors hover:bg-surface hover:text-ink">Experience</a>
            <a href="#roles" className="rounded-full px-4 py-2 transition-colors hover:bg-surface hover:text-ink">For everyone</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <HomeThemeToggle />
            <Link href="/pricing" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-ink sm:inline-flex">
              Pricing
            </Link>
            <Link href="/sign-in" className="landing-button-secondary hidden px-4 py-2.5 text-sm sm:inline-flex">
              Sign in
            </Link>
            <Link href="/pricing" className="landing-button-primary px-4 py-2.5 text-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate px-5 pb-20 pt-36 sm:px-8 sm:pt-44 lg:pb-28 lg:pt-48">
        <div className="hero-grid absolute inset-0 -z-20" />
        <div className="hero-glow hero-glow-one absolute -z-10" />
        <div className="hero-glow hero-glow-two absolute -z-10" />
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 xl:gap-20">
          <div className="relative z-10 max-w-2xl">
            <div className="hero-reveal hero-reveal-1 mb-7 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-brand shadow-sm backdrop-blur">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                <Icon name="sparkles" className="h-3 w-3" />
              </span>
              Intelligence for the whole school
            </div>
            <h1 className="hero-reveal hero-reveal-2 text-balance text-[3.25rem] font-bold leading-[0.98] tracking-[-0.065em] sm:text-6xl lg:text-[4.6rem] xl:text-[5.1rem]">
              Where better learning <span className="hero-gradient-text">takes shape.</span>
            </h1>
            <p className="hero-reveal hero-reveal-3 mt-7 max-w-xl text-pretty text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
              NeuraLearn gives your entire school one beautifully simple place to teach, learn, manage, and grow—with AI built into the work that matters.
            </p>
            <div className="hero-reveal hero-reveal-4 mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing" className="landing-button-primary group gap-2 px-6 py-3.5">
                Start with NeuraLearn
                <Icon name="arrow" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a href="#platform" className="landing-button-secondary group gap-2 px-6 py-3.5">
                Explore the platform
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-[9px] transition-transform duration-300 group-hover:scale-110">↓</span>
              </a>
            </div>
            <div className="hero-reveal hero-reveal-5 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-ink-muted">
              <span className="flex items-center gap-2"><span className="check-dot"><Icon name="check" className="h-3 w-3" /></span>Secure, role-aware access</span>
              <span className="flex items-center gap-2"><span className="check-dot"><Icon name="check" className="h-3 w-3" /></span>Built for every role</span>
            </div>
          </div>

          <div className="hero-reveal hero-reveal-3 relative mx-auto w-full max-w-[760px] lg:max-w-none">
            <div className="dashboard-aura absolute inset-[8%] rounded-full blur-3xl" />
            <div className="dashboard-frame relative overflow-hidden rounded-[28px] p-2 shadow-2xl sm:p-3">
              <div className="dashboard-window overflow-hidden rounded-[21px]">
                <div className="flex h-11 items-center justify-between border-b border-line/70 px-4 sm:px-5">
                  <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ff6b69]" /><span className="h-2.5 w-2.5 rounded-full bg-[#ffbd45]" /><span className="h-2.5 w-2.5 rounded-full bg-[#55c995]" /></div>
                  <div className="flex h-6 w-28 items-center gap-1.5 rounded-md bg-surface-subtle/80 px-2 text-[7px] text-ink-subtle sm:w-44">
                    <span className="h-2 w-2 rounded-full border border-current" /> Search anything
                  </div>
                  <span className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-600 ring-2 ring-surface" />
                </div>
                <div className="grid min-h-[390px] grid-cols-[52px_1fr] sm:min-h-[470px] sm:grid-cols-[132px_1fr]">
                  <aside className="border-r border-line/70 bg-surface-muted/65 p-2.5 sm:p-3">
                    <div className="mb-6 flex items-center gap-2 px-1 sm:px-2">
                      <Image src="/logo.png" alt="" width={18} height={18} />
                      <span className="hidden text-[9px] font-bold sm:inline">NeuraLearn</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        ["home", true], ["users", false], ["calendar", false], ["chart", false], ["settings", false],
                      ].map(([item, active], index) => (
                        <div key={String(item)} className={`flex h-8 items-center gap-2 rounded-lg px-2 ${active ? "bg-brand text-white shadow-sm" : "text-ink-subtle"}`}>
                          <span className={`block h-3 w-3 rounded-[4px] border ${active ? "border-white/70" : "border-current"}`} />
                          <span className="hidden text-[7px] font-semibold capitalize sm:inline">{String(item)}</span>
                          {index === 2 && <span className="ml-auto hidden h-3 min-w-3 rounded-full bg-amber-400 px-1 text-center text-[6px] leading-3 text-white sm:inline">3</span>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-20 hidden rounded-xl border border-line/70 bg-surface p-2.5 text-[7px] sm:block">
                      <div className="mb-2 flex h-6 w-6 items-center justify-center rounded-lg bg-brand/10 text-brand"><Icon name="sparkles" className="h-3 w-3" /></div>
                      <p className="font-bold">Neura AI</p>
                      <p className="mt-0.5 text-ink-subtle">Ready when you are.</p>
                    </div>
                  </aside>

                  <div className="bg-surface p-3 sm:p-5">
                    <div className="flex items-start justify-between">
                      <div><p className="text-[7px] font-medium text-ink-subtle sm:text-[9px]">YOUR SCHOOL AT A GLANCE</p><h2 className="mt-1 text-sm font-bold tracking-tight sm:text-lg">Good morning, Alex <span className="inline-block animate-wave">👋</span></h2></div>
                      <button type="button" className="rounded-lg bg-brand px-2 py-1.5 text-[7px] font-semibold text-white shadow-sm sm:px-3 sm:text-[8px]">+ Quick action</button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        ["Students", "1,248", "+18", "bg-indigo-500"],
                        ["Attendance", "94.8%", "+2.4%", "bg-emerald-500"],
                        ["Avg. result", "87.2", "+4.1", "bg-amber-500"],
                      ].map(([label, value, delta, color]) => (
                        <div key={label} className="mini-stat rounded-xl border border-line/70 bg-surface-muted/50 p-2.5 sm:p-3.5">
                          <div className="flex items-center justify-between"><span className={`h-5 w-5 rounded-md ${color} opacity-90 sm:h-6 sm:w-6`} /><span className="rounded-full bg-emerald-500/10 px-1 py-0.5 text-[6px] font-bold text-emerald-600 dark:text-emerald-400 sm:text-[7px]">{delta}</span></div>
                          <p className="mt-3 text-[7px] text-ink-subtle sm:text-[8px]">{label}</p><p className="mt-0.5 text-xs font-bold sm:text-base">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-[1.45fr_.85fr]">
                      <div className="rounded-xl border border-line/70 bg-surface-muted/30 p-3 sm:p-4">
                        <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold sm:text-[10px]">Learning overview</p><p className="mt-0.5 text-[6px] text-ink-subtle sm:text-[7px]">Engagement across this week</p></div><span className="rounded-md border border-line px-1.5 py-1 text-[6px] text-ink-muted">This week⌄</span></div>
                        <svg className="mt-3 h-[88px] w-full overflow-visible sm:h-[130px]" viewBox="0 0 360 150" preserveAspectRatio="none" aria-hidden="true">
                          <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgb(var(--brand))" stopOpacity=".25" /><stop offset="1" stopColor="rgb(var(--brand))" stopOpacity="0" /></linearGradient></defs>
                          <g className="chart-grid-lines"><path d="M0 20H360M0 60H360M0 100H360M0 140H360" /></g>
                          <path d="M0 125C32 120 38 78 70 88s43 27 70-5 45-8 72-18 42-55 70-35 45 5 78-17V150H0Z" fill="url(#chartFill)" />
                          <path className="chart-line" pathLength="1" d="M0 125C32 120 38 78 70 88s43 27 70-5 45-8 72-18 42-55 70-35 45 5 78-17" />
                          <circle className="chart-pulse" cx="282" cy="30" r="4" fill="rgb(var(--brand))" />
                        </svg>
                        <div className="flex justify-between text-[6px] text-ink-subtle"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
                      </div>
                      <div className="hidden rounded-xl border border-line/70 bg-surface-muted/30 p-3 sm:block sm:p-4">
                        <div className="flex items-center justify-between"><p className="text-[10px] font-bold">Today</p><span className="text-[7px] text-brand">View all</span></div>
                        <div className="mt-3 space-y-2.5">
                          {[
                            ["08:30", "Mathematics", "bg-indigo-500"],
                            ["10:15", "Biology", "bg-emerald-500"],
                            ["12:00", "Physics", "bg-amber-500"],
                          ].map(([time, subject, color]) => (
                            <div key={subject} className="flex items-center gap-2 rounded-lg bg-surface p-2 shadow-sm"><span className={`h-6 w-1 rounded-full ${color}`} /><span><span className="block text-[6px] text-ink-subtle">{time}</span><span className="block text-[7px] font-bold">{subject}</span></span></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card floating-card-one absolute -left-7 top-[24%] hidden items-center gap-3 rounded-2xl p-3 shadow-xl sm:flex lg:-left-12">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500"><Icon name="attendance" className="h-5 w-5" /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-surface" /></span>
              <span><span className="block text-[9px] font-bold">Attendance saved</span><span className="mt-0.5 block text-[7px] text-ink-subtle">Grade 10 · Just now</span></span>
            </div>
            <div className="floating-card floating-card-two absolute -bottom-8 right-5 flex items-center gap-3 rounded-2xl p-3.5 shadow-xl sm:right-10 lg:-right-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500"><Icon name="sparkles" className="h-5 w-5" /></span>
              <span><span className="block text-[9px] font-bold">Quiz generated</span><span className="mt-0.5 block text-[7px] text-ink-subtle">12 questions ready to review</span></span>
              <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white"><Icon name="check" className="h-3 w-3" /></span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Platform highlights" className="border-y border-line/70 bg-surface/55 py-5 backdrop-blur">
        <div className="marquee-mask mx-auto max-w-7xl overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-4">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-4 pr-4">
                {["AI quiz generation", "Live attendance", "Role-aware dashboards", "Smart schedules", "Progress insights", "Secure by design"].map((item, index) => (
                  <span key={item} className="flex items-center gap-4 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.13em] text-ink-subtle"><span className={`h-1.5 w-1.5 rounded-full ${index % 2 ? "bg-violet-400" : "bg-brand"}`} />{item}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="section-kicker">A calmer way to run school</span>
            <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl lg:text-[3.5rem]">Powerful where it matters. Simple everywhere else.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-muted sm:text-lg">Thoughtful tools for the work your teams do every day, connected in one clear and consistent experience.</p>
          </div>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className={`feature-card group relative overflow-hidden rounded-[26px] border border-line/80 bg-surface p-7 shadow-sm sm:p-8 ${index === 1 ? "lg:translate-y-6" : ""}`}>
                <span className="feature-card-glow absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="mb-12 flex items-center justify-between">
                    <span className="feature-icon flex h-12 w-12 items-center justify-center rounded-2xl text-brand"><Icon name={feature.icon} className="h-6 w-6" /></span>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-subtle">0{index + 1}</span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">{feature.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.035em]">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-ink-muted">{feature.description}</p>
                  <a href="#experience" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-ink transition-colors hover:text-brand">See how it works <Icon name="arrow" className="h-4 w-4" /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experience" className="scroll-mt-20 px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="experience-panel relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-line/70 px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="experience-orb absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr] lg:gap-20">
            <div>
              <span className="section-kicker">Neura AI</span>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Give every teacher a thoughtful head start.</h2>
              <p className="mt-5 text-base leading-7 text-ink-muted">Build a quiz from a document, shape it to your class, then assign it—all without jumping between tools.</p>
              <div className="mt-8 space-y-5">
                {[
                  ["01", "Bring your material", "Upload the content your class already uses."],
                  ["02", "Let Neura draft", "Get balanced questions and answers in seconds."],
                  ["03", "Review and assign", "You stay in control before anything reaches students."],
                ].map(([number, title, detail]) => (
                  <div key={number} className="group flex gap-4">
                    <span className="step-number flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">{number}</span>
                    <div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-ink-muted">{detail}</p></div>
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="landing-button-primary group mt-9 gap-2 px-5 py-3">Try Neura AI <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </div>

            <div className="ai-composer relative mx-auto w-full max-w-2xl rounded-[26px] border border-line/80 bg-surface p-3 shadow-2xl sm:p-5">
              <div className="rounded-[19px] border border-line/70 bg-surface-muted/45 p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-line/70 pb-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand/20"><Icon name="sparkles" className="h-4 w-4" /></span><span><span className="block text-xs font-bold">Create with Neura</span><span className="text-[10px] text-ink-subtle">Quiz assistant</span></span></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Ready</span></div>
                <div className="mt-5 rounded-xl border border-line/80 bg-surface p-4">
                  <p className="text-[10px] font-semibold text-ink-subtle">SOURCE MATERIAL</p>
                  <div className="mt-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-[9px] font-black text-rose-500">PDF</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">Introduction to cellular biology.pdf</span><span className="mt-0.5 block text-[9px] text-ink-subtle">18 pages · 2.4 MB</span></span><span className="text-emerald-500"><Icon name="check" className="h-4 w-4" /></span></div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {[ ["Questions", "12"], ["Difficulty", "Balanced"], ["Format", "Mixed"] ].map(([label, value]) => <div key={label} className="rounded-xl border border-line/80 bg-surface p-3"><span className="block text-[8px] text-ink-subtle">{label}</span><span className="mt-1 block text-[10px] font-bold sm:text-xs">{value}</span></div>)}
                </div>
                <button type="button" className="ai-generate-button relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand py-3 text-xs font-bold text-white shadow-lg shadow-brand/20"><span className="button-shimmer absolute inset-y-0 w-24 -skew-x-12 bg-white/20 blur-md" /><Icon name="sparkles" className="h-4 w-4" />Generate quiz</button>
                <div className="mt-5 space-y-2.5">
                  {["What is the primary function of the cell membrane?", "Which organelle produces energy for the cell?"].map((question, index) => <div key={question} className="question-row flex items-start gap-3 rounded-xl border border-line/70 bg-surface px-3 py-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand/10 text-[8px] font-bold text-brand">{index + 1}</span><span className="text-[10px] font-semibold leading-5">{question}</span><span className="ml-auto text-ink-subtle">•••</span></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="scroll-mt-20 border-y border-line/70 bg-surface px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div>
              <span className="section-kicker">One connected community</span>
              <h2 className="mt-5 text-balance text-4xl font-bold tracking-[-0.05em] sm:text-5xl">A better view for everyone.</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-ink-muted">Every person sees exactly what helps them move forward. No clutter, no maze of menus, no lost context.</p>
              <div className="mt-9 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["AM", "SK", "JL", "RN"].map((initials, index) => <span key={initials} className={`avatar-chip avatar-${index} flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface text-[9px] font-bold text-white`}>{initials}</span>)}
                </div>
                <p className="text-xs leading-5 text-ink-muted"><strong className="block text-ink">Four roles. One source of truth.</strong>Always in sync.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {roleCards.map((role, index) => (
                <article key={role.label} className="role-card group relative overflow-hidden rounded-2xl border border-line/80 bg-surface-muted/55 p-6">
                  <span className={`role-accent role-accent-${role.accent} absolute bottom-0 left-0 top-0 w-1`} />
                  <div className="flex items-start justify-between gap-5"><span className={`role-icon role-icon-${role.accent} flex h-11 w-11 items-center justify-center rounded-xl`}><Icon name={index === 0 ? "shield" : index === 2 ? "calendar" : "people"} className="h-5 w-5" /></span><Icon name="arrow" className="h-4 w-4 -translate-x-1 text-ink-subtle opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" /></div>
                  <h3 className="mt-8 text-base font-bold">{role.label}</h3><p className="mt-2 text-sm leading-6 text-ink-muted">{role.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:py-32">
        <div className="cta-panel relative mx-auto max-w-7xl overflow-hidden rounded-[32px] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <div className="cta-grid absolute inset-0 opacity-20" />
          <span className="cta-orb cta-orb-left absolute" /><span className="cta-orb cta-orb-right absolute" />
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur">Your school, moving forward</span>
            <h2 className="mt-6 text-balance text-4xl font-bold tracking-[-0.055em] sm:text-5xl lg:text-6xl">Make every school day feel more connected.</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-indigo-100/80">Bring your people, data, and daily work together in a platform everyone will actually enjoy using.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-indigo-700 shadow-xl transition-transform hover:-translate-y-0.5">Get started <Icon name="arrow" className="h-4 w-4" /></Link>
              <Link href="/sign-in" className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/15">Sign in to your school</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line/70 bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div><Link href="/" className="flex items-center gap-2.5"><span className="logo-shell flex h-9 w-9 items-center justify-center rounded-xl"><Image src="/logo.png" alt="" width={22} height={22} /></span><span className="font-bold tracking-tight">NeuraLearn</span></Link><p className="mt-3 text-xs text-ink-subtle">Intelligence for the whole school.</p></div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-ink-muted"><a href="#platform" className="hover:text-ink">Platform</a><a href="#roles" className="hover:text-ink">For everyone</a><Link href="/pricing" className="hover:text-ink">Pricing</Link><Link href="/sign-up/student" className="hover:text-ink">Student sign-up</Link></div>
          </div>
          <div className="mt-9 flex flex-col gap-3 border-t border-line/70 pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} NeuraLearn. All rights reserved.</span><span>Built to make learning feel effortless.</span></div>
        </div>
      </footer>
    </main>
  );
}
