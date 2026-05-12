"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncFromStripeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onClick = async () => {
    setError(null);
    setOk(false);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/sync", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Sync failed.");
      setOk(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="text-xs underline text-ink-muted disabled:opacity-60"
      >
        {loading ? "Syncing…" : "Sync subscription from Stripe"}
      </button>
      {ok && (
        <p className="mt-1 text-xs text-emerald-500">Synced.</p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
