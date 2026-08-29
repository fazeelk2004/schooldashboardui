"use client";

import { ITEM_PER_PAGE } from "@/lib/settings";
import { useRouter } from "next/navigation";

const Pagination = ({ page, count }: { page: number; count: number }) => {
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(count / ITEM_PER_PAGE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`${window.location.pathname}?${params}`);
  };

  const start = count === 0 ? 0 : ITEM_PER_PAGE * (page - 1) + 1;
  const end = Math.min(ITEM_PER_PAGE * page, count);

  // Compact page list with ellipses
  const pageButtons: (number | "…")[] = [];
  const push = (n: number | "…") => pageButtons.push(n);
  const window2 = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - window2 && i <= page + window2)
    ) {
      push(i);
    } else if (pageButtons[pageButtons.length - 1] !== "…") {
      push("…");
    }
  }

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-line/70 pt-4 sm:flex-row">
      <p className="text-xs text-ink-subtle">
        Showing <span className="font-medium text-ink">{start}</span>–
        <span className="font-medium text-ink">{end}</span> of{" "}
        <span className="font-medium text-ink">{count}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          disabled={!hasPrev}
          onClick={() => changePage(page - 1)}
          className="rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition hover:border-brand/20 hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        {pageButtons.map((p, idx) =>
          p === "…" ? (
            <span
              key={`e-${idx}`}
              className="px-2 text-xs text-ink-subtle"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => changePage(p)}
              className={`min-w-[34px] rounded-lg px-2 py-2 text-xs font-semibold transition ${
                page === p
                  ? "bg-brand text-white"
                  : "border border-line bg-surface text-ink-muted hover:bg-surface-subtle"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={!hasNext}
          onClick={() => changePage(page + 1)}
          className="rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition hover:border-brand/20 hover:bg-surface-subtle disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
