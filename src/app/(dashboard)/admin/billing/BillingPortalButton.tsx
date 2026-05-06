"use client";

import { useState } from "react";

export default function BillingPortalButton({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not open billing portal.");
      }
      window.location.href = json.url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  if (!hasSubscription) {
    return (
      <p className="text-sm text-ink-muted">
        No active Stripe subscription is linked to this school.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={loading}
        className="btn-primary px-6 py-3 disabled:opacity-60"
      >
        {loading ? "Opening…" : "Manage subscription"}
      </button>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
