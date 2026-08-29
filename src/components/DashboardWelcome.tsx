import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

type DashboardAction = {
  label: string;
  href: string;
  primary?: boolean;
};

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

const SparkleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
    <path d="m12 3-1.1 3.4a6.4 6.4 0 0 1-4.1 4.1L3.5 11.6l3.3 1.1a6.4 6.4 0 0 1 4.1 4.1L12 20.2l1.1-3.4a6.4 6.4 0 0 1 4.1-4.1l3.3-1.1-3.3-1.1a6.4 6.4 0 0 1-4.1-4.1L12 3Z" />
  </svg>
);

const DashboardWelcome = async ({
  role,
  title,
  description,
  actions = [],
}: {
  role: string;
  title?: string;
  description: string;
  actions?: DashboardAction[];
}) => {
  const user = await currentUser();
  const firstName = user?.firstName || "there";
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <section className="dashboard-welcome relative overflow-hidden rounded-[26px] border border-line/70 p-6 sm:p-7">
      <div className="dashboard-welcome-grid absolute inset-0" />
      <div className="dashboard-welcome-orb absolute -right-16 -top-20 h-56 w-56 rounded-full" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="dashboard-role-chip inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
              <SparkleIcon /> {role} workspace
            </span>
            <span className="text-xs font-medium text-ink-subtle">{date}</span>
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl">
            {title ?? `Good to see you, ${firstName}.`}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-muted sm:text-base">
            {description}
          </p>
        </div>

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {actions.map((action) => (
              <Link
                href={action.href}
                key={action.href}
                className={action.primary ? "dashboard-action-primary group" : "dashboard-action-secondary group"}
              >
                {action.label}
                <ArrowIcon />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DashboardWelcome;
