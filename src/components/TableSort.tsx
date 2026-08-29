"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type SortOption = { value: string; label: string };

const TableSort = ({
  options,
  defaultOrder = "asc",
}: {
  options: SortOption[];
  defaultOrder?: "asc" | "desc";
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get("sort") ?? "";
  const currentOrder = (searchParams.get("order") as "asc" | "desc") ?? defaultOrder;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const apply = (sort: string, order: "asc" | "desc") => {
    const params = new URLSearchParams(window.location.search);
    if (sort) params.set("sort", sort);
    else params.delete("sort");
    params.set("order", order);
    params.delete("page");
    router.push(`${window.location.pathname}?${params}`);
  };

  const clear = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("sort");
    params.delete("order");
    params.delete("page");
    router.push(`${window.location.pathname}?${params}`);
    setOpen(false);
  };

  const active = !!currentSort;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-line/80 bg-surface-muted text-ink-muted shadow-sm transition hover:border-brand/25 hover:bg-surface hover:text-brand ${
          active ? "ring-2 ring-brand/40" : ""
        }`}
        aria-label="Sort"
        aria-expanded={open}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h13M3 12h9M3 18h5M18 4v16m-3-3 3 3 3-3" /></svg>
      </button>
      {open && (
        <div className="dashboard-popover absolute right-0 z-30 mt-2 w-56 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">
            Sort by
          </p>
          <div className="flex flex-col gap-1">
            {options.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => apply(o.value, currentOrder)}
                className={`text-left text-sm px-2 py-1.5 rounded-md hover:bg-surface-subtle transition ${
                  currentSort === o.value
                    ? "bg-surface-subtle font-medium text-ink"
                    : "text-ink-muted"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                apply(currentSort || options[0]?.value || "", "asc")
              }
              className={`flex-1 text-xs px-2 py-1.5 rounded-md hover:bg-surface-subtle transition ${
                currentOrder === "asc"
                  ? "bg-surface-subtle font-medium text-ink"
                  : "text-ink-muted"
              }`}
            >
              Ascending
            </button>
            <button
              type="button"
              onClick={() =>
                apply(currentSort || options[0]?.value || "", "desc")
              }
              className={`flex-1 text-xs px-2 py-1.5 rounded-md hover:bg-surface-subtle transition ${
                currentOrder === "desc"
                  ? "bg-surface-subtle font-medium text-ink"
                  : "text-ink-muted"
              }`}
            >
              Descending
            </button>
          </div>
          {active && (
            <button
              type="button"
              onClick={clear}
              className="mt-2 w-full text-xs text-ink-subtle hover:text-ink py-1.5 rounded-md hover:bg-surface-subtle transition"
            >
              Clear sort
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableSort;
