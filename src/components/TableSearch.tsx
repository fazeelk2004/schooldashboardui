"use client";

import { useRouter } from "next/navigation";

const TableSearch = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;

    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="group flex w-full items-center gap-2.5 rounded-xl border border-line/80 bg-surface-muted/50 px-3.5 py-2.5 shadow-sm transition focus-within:border-brand/50 focus-within:bg-surface focus-within:ring-4 focus-within:ring-brand/10 md:w-72"
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
        className="shrink-0 text-ink-subtle transition-colors group-focus-within:text-brand"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Search records..."
        className="w-full bg-transparent text-[13px] font-medium text-ink placeholder:font-normal placeholder:text-ink-subtle outline-none"
      />
    </form>
  );
};

export default TableSearch;
