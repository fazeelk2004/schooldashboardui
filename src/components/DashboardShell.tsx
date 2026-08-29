"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DashboardShell = ({
  sidebar,
  navbar,
  children,
}: {
  sidebar: ReactNode;
  navbar: ReactNode;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + esc-to-close while drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="dashboard-shell flex h-screen bg-surface-muted text-ink">
      {/* SIDEBAR — drawer on mobile, fixed column on md+ */}
      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-[278px] flex-col border-r border-line/70 bg-surface px-3.5 py-5 transform transition-transform duration-300 ease-out
          md:static md:translate-x-0 md:w-[88px] lg:w-[264px]
          ${open ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}`}
      >
        {sidebar}
      </aside>

      {/* BACKDROP — mobile only */}
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="dashboard-backdrop fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* MAIN */}
      <div className="dashboard-main relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        {/* Hamburger — sits over navbar's empty left area on mobile */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="fixed left-3 top-2.5 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-line/70 bg-surface/80 text-ink-muted shadow-sm backdrop-blur hover:bg-surface-subtle hover:text-ink md:hidden"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {navbar}
        <main className="dashboard-content relative flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;
