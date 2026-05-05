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
      className="hidden md:flex items-center gap-2 rounded-xl border border-line bg-surface-muted px-3 py-2 w-[280px] focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 transition"
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
        className="text-ink-subtle"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search students, teachers, classes..."
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-subtle outline-none"
      />
    </form>
  );
}
