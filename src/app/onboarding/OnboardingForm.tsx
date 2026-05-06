"use client";

import { useState } from "react";
import type { PlanKey } from "@/lib/plans";

export default function OnboardingForm({ plan }: { plan: PlanKey }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      plan,
      schoolDraft: {
        name: String(fd.get("schoolName") ?? "").trim(),
        address: String(fd.get("address") ?? "").trim() || null,
        phone: String(fd.get("phone") ?? "").trim() || null,
        email: String(fd.get("schoolEmail") ?? "").trim() || null,
        website: String(fd.get("website") ?? "").trim() || null,
        description: String(fd.get("description") ?? "").trim() || null,
      },
      adminDraft: {
        username: String(fd.get("username") ?? "").trim(),
        email: String(fd.get("adminEmail") ?? "").trim(),
        password: String(fd.get("password") ?? ""),
      },
    };

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Could not start checkout.");
      }
      window.location.href = json.url;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide">
          School details
        </h2>
      </div>

      <Field name="schoolName" label="School name" required />
      <Field name="schoolEmail" label="School email" type="email" />
      <Field name="phone" label="Phone" />
      <Field name="website" label="Website" />
      <Field name="address" label="Address" className="md:col-span-2" />
      <Field name="description" label="Description" className="md:col-span-2" />

      <div className="md:col-span-2 mt-4">
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide">
          Admin account
        </h2>
        <p className="text-xs text-ink-subtle mt-1">
          You&apos;ll use these credentials to sign in once payment is complete.
        </p>
      </div>

      <Field name="username" label="Username" required />
      <Field name="adminEmail" label="Email" type="email" required />
      <Field
        name="password"
        label="Password"
        type="password"
        required
        className="md:col-span-2"
      />

      {error && (
        <div className="md:col-span-2 text-sm text-red-500">{error}</div>
      )}

      <div className="md:col-span-2 flex justify-end mt-2">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-3 disabled:opacity-60"
        >
          {loading ? "Redirecting…" : "Continue to payment"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  className,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className="text-ink-muted">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
      />
    </label>
  );
}
