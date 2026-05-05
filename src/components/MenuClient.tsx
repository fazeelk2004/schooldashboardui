"use client";

import Image from "next/image";
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

const MenuClient = ({
  groups,
  role,
}: {
  groups: MenuGroup[];
  role: string;
}) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <nav className="mt-2 flex-1 overflow-y-auto pr-1">
        {groups.map((g) => (
          <div className="flex flex-col gap-0.5" key={g.title}>
            <span className="block md:hidden lg:block px-3 mt-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
              {g.title}
            </span>
            {g.items.map((item) => {
              if (!item.visible.includes(role)) return null;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className={`group relative flex items-center justify-start md:justify-center lg:justify-start gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-ink-muted hover:bg-surface-subtle hover:text-ink"
                  }`}
                >
                  {active && (
                    <span className="block md:hidden lg:block absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                  )}
                  <Image
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                    className={active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}
                  />
                  <span className="block md:hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* DARK MODE TOGGLE — pinned to bottom */}
      <div className="mt-3 border-t border-line pt-3">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default MenuClient;
