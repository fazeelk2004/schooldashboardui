"use client";

import { useState } from "react";

export default function BillingPortalButton({
  hasSubscription,
}: {
  hasSubscription: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPortal = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const json = await response.json();
      if (!response.ok || !json.url) {
        throw new Error(json.error ?? "Could not open billing portal.");
      }
      window.location.href = json.url;
    } catch (portalError: unknown) {
      setError(
        portalError instanceof Error ? portalError.message : "Something went wrong."
      );
      setLoading(false);
    }
  };

  if (!hasSubscription) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface-muted/60 p-4">
        <p className="text-xs font-bold text-ink">No payment method needed</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          Upgrade to a paid plan to manage payment details through Stripe.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="btn-primary w-full py-3 disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
            Opening portal
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 10h18M7 15h3" /></svg>
            Manage payment details
          </>
        )}
      </button>
      {error && <p className="mt-3 text-xs font-semibold text-rose-500">{error}</p>}
    </div>
  );
}
