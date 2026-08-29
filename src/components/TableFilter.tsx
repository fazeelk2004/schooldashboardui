"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type FilterField = {
  key: string;
  label: string;
  options: { value: string; label: string }[];
};

const TableFilter = ({ fields }: { fields: FilterField[] }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${window.location.pathname}?${params}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams(window.location.search);
    fields.forEach((f) => params.delete(f.key));
    params.delete("page");
    router.push(`${window.location.pathname}?${params}`);
  };

  const activeCount = fields.filter((f) => searchParams.get(f.key)).length;

  if (fields.length === 0) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-line/80 bg-surface-muted text-ink-muted shadow-sm transition hover:border-brand/25 hover:bg-surface hover:text-brand ${
          activeCount > 0 ? "ring-2 ring-brand/40" : ""
        }`}
        aria-label="Filter"
        aria-expanded={open}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 5h16M7 12h10M10 19h4" /></svg>
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] rounded-full min-w-4 h-4 px-1 flex items-center justify-center font-semibold">
            {activeCount}
          </span>
        )}
      </button>
      {open && (
        <div className="dashboard-popover absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide mb-2">
            Filters
          </p>
          <div className="flex flex-col gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-ink-muted mb-1">
                  {f.label}
                </label>
                <select
                  value={searchParams.get(f.key) ?? ""}
                  onChange={(e) => setParam(f.key, e.target.value)}
                  className="input-base py-2"
                >
                  <option value="">All</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 w-full text-xs text-ink-subtle hover:text-ink py-1.5 rounded-md hover:bg-surface-subtle transition border-t border-line pt-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TableFilter;
