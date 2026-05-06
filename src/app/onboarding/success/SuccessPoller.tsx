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
        const res = await fetch(
          `/api/stripe/provision-status?session_id=${encodeURIComponent(sessionId)}`
        );
        const json = await res.json();
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
    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (status === "ready") {
    return (
      <div className="mt-6">
        <p className="text-sm text-ink-muted mb-4">
          Your school is ready. Sign in with the admin account you just created.
        </p>
        <Link href="/sign-in" className="btn-primary px-6 py-3">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-6 text-sm text-red-500">
        Provisioning is taking longer than expected. Please contact support if
        you don't receive access shortly.
      </div>
    );
  }

  return (
    <div className="mt-6 text-sm text-ink-muted flex items-center justify-center gap-2">
      <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-brand" />
      Provisioning your school…
    </div>
  );
}
