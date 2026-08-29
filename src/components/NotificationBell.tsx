"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { markNotificationsRead } from "@/lib/actions";

export type NotificationItem = {
  id: number;
  title: string;
  description: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const typeAccent: Record<string, string> = {
  ASSIGNMENT: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  EXAM: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  QUIZ: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  STUDENT: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  ANNOUNCEMENT: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  GENERAL: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

export default function NotificationBell({
  initialItems,
}: {
  initialItems: NotificationItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement | null>(null);

  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const ids = items.filter((i) => !i.read).map((i) => i.id);
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
      startTransition(() => {
        markNotificationsRead(ids);
      });
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Notifications"
        onClick={handleOpen}
        className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-line/75 bg-surface-muted/60 text-ink-muted shadow-sm transition hover:border-brand/20 hover:bg-surface-subtle hover:text-brand md:inline-flex"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="dashboard-popover absolute right-0 z-50 mt-2 max-h-[440px] w-80 overflow-y-auto rounded-2xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-surface">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
            <span className="text-[11px] text-ink-subtle">{items.length} total</span>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-ink-subtle">
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((n) => {
                const body = (
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-subtle">
                    <span
                      className={`mt-0.5 inline-flex shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        typeAccent[n.type] || typeAccent.GENERAL
                      }`}
                    >
                      {n.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-ink-muted line-clamp-2">
                        {n.description}
                      </p>
                      <p className="text-[10px] text-ink-subtle mt-1">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)}>
                        {body}
                      </Link>
                    ) : (
                      body
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
