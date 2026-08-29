"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export type MenuItem = {
  icon: string;
  label: string;
  href: string;
  visible: string[];
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
};

const NavIcon = ({ href }: { href: string }) => {
  let path: React.ReactNode;

  if (href === "/") {
    path = <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>;
  } else if (href.includes("attendance")) {
    path = <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M8 2v4M16 2v4M3 9h18m-13 5 2 2 5-5" /></>;
  } else if (href.includes("quiz")) {
    path = <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M9 13h.01M13 13h3M9 17h.01M13 17h3" /></>;
  } else if (href.includes("teacher")) {
    path = <><circle cx="12" cy="8" r="4" /><path d="M5 21v-2a7 7 0 0 1 14 0v2M19 5l2 1-2 1" /></>;
  } else if (href.includes("student") || href.includes("signup")) {
    path = <><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11.5V16c3 2.4 9 2.4 12 0v-4.5M22 9v6" /></>;
  } else if (href.includes("parent") || href.includes("admin")) {
    path = <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M16 11h6" /></>;
  } else if (href.includes("school")) {
    path = <><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-5h6v5M8 11h.01M12 11h.01M16 11h.01" /></>;
  } else if (href.includes("class") || href.includes("grade")) {
    path = <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M7 8h10M7 12h6M7 16h8" /></>;
  } else if (href.includes("subject") || href.includes("lesson")) {
    path = <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /><path d="M8 7h8M8 11h6" /></>;
  } else if (href.includes("exam") || href.includes("assignment") || href.includes("result")) {
    path = <><path d="M6 2h9l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="M14 2v5h5M8 12h7M8 16h7" /></>;
  } else if (href.includes("event")) {
    path = <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M8 2v4M16 2v4M3 9h18M8 13h3M8 17h6" /></>;
  } else {
    path = <><path d="M4 4h16v16H4z" /><path d="m8 12 3 3 5-6" /></>;
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">
      {path}
    </svg>
  );
};

const MenuClient = ({ groups, role }: { groups: MenuGroup[]; role: string }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="dashboard-nav mt-1 flex-1 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div className="flex flex-col gap-1" key={group.title}>
            <span className="mb-2 mt-3 block px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-ink-subtle md:hidden lg:block">
              {group.title}
            </span>
            {group.items.map((item) => {
              if (!item.visible.includes(role)) return null;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  title={item.label}
                  className={`dashboard-nav-item group relative flex items-center justify-start gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold md:justify-center lg:justify-start ${active ? "is-active" : ""}`}
                >
                  <span className="dashboard-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]">
                    <NavIcon href={item.href} />
                  </span>
                  <span className="block md:hidden lg:block">{item.label}</span>
                  {active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-brand md:hidden lg:block" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-3 border-t border-line/70 pt-3">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default MenuClient;
