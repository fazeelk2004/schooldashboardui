"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncFromStripeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synced, setSynced] = useState(false);

  const syncSubscription = async () => {
    setError(null);
    setSynced(false);
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/sync", { method: "POST" });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error ?? "Sync failed.");
      setSynced(true);
      router.refresh();
    } catch (syncError: unknown) {
      setError(syncError instanceof Error ? syncError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 text-center">
      <button
        type="button"
        onClick={syncSubscription}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-bold text-ink-subtle transition hover:bg-surface-subtle hover:text-ink disabled:opacity-60"
      >
        <svg className={loading ? "animate-spin" : ""} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-5V2M4 17h5v5M19 7a8 8 0 0 0-13.7-2.7L4 6M5 17a8 8 0 0 0 13.7 2.7L20 18" /></svg>
        {loading ? "Syncing subscription" : "Sync latest details from Stripe"}
      </button>
      {synced && <p className="mt-1 text-[11px] font-semibold text-emerald-500">Subscription synced.</p>}
      {error && <p className="mt-1 text-[11px] font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
