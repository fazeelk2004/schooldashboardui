"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavbarSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="group hidden w-[300px] items-center gap-2.5 rounded-xl border border-line/80 bg-surface-muted/75 px-3.5 py-2.5 shadow-sm transition focus-within:border-brand/50 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand/10 md:flex"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-subtle transition-colors group-focus-within:text-brand"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search your workspace..."
        className="w-full bg-transparent text-[13px] font-medium text-ink placeholder:font-normal placeholder:text-ink-subtle outline-none"
      />
    </form>
  );
}
