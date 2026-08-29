"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPoller({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<"pending" | "ready" | "failed">("pending");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/stripe/provision-status?session_id=${encodeURIComponent(sessionId)}`
        );
        const json = await response.json();
        if (cancelled) return;
        if (json.ready) {
          setStatus("ready");
          return;
        }
      } catch {}

      if (attempts >= maxAttempts) {
        setStatus("failed");
        return;
      }
      setTimeout(poll, 2000);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (status === "ready") {
    return (
      <div className="form-step-enter mt-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m5 12 4 4L19 6" /></svg>
        </div>
        <p className="mt-4 text-sm font-bold text-ink">Your workspace is ready</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">
          Sign in with the administrator credentials you just created.
        </p>
        <Link href="/sign-in" className="btn-primary mt-6 px-7 py-3">
          Open my workspace
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div role="alert" className="form-step-enter mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-left">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-amber-500">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 17h.01" /></svg>
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Setup is taking a little longer</p>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Your payment is safe. Please contact support if access does not arrive shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7" aria-live="polite">
      <div className="public-loader mx-auto" aria-hidden="true"><span /></div>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-ink">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
        Provisioning your school
      </div>
      <p className="mt-2 text-xs leading-5 text-ink-subtle">
        Creating accounts, permissions, and your secure workspace…
      </p>
      <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-surface-subtle">
        <span className="provision-progress block h-full rounded-full bg-brand" />
      </div>
    </div>
  );
}
