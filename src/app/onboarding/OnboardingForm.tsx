"use client";

import { useState } from "react";
import type { PlanKey } from "@/lib/plans";

export default function OnboardingForm({ plan }: { plan: PlanKey }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const body = {
      plan,
      schoolDraft: {
        name: String(formData.get("schoolName") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim() || null,
        phone: String(formData.get("phone") ?? "").trim() || null,
        email: String(formData.get("schoolEmail") ?? "").trim() || null,
        website: String(formData.get("website") ?? "").trim() || null,
        description: String(formData.get("description") ?? "").trim() || null,
      },
      adminDraft: {
        username: String(formData.get("username") ?? "").trim(),
        email: String(formData.get("adminEmail") ?? "").trim(),
        password: String(formData.get("password") ?? ""),
      },
    };

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok || !json.url) {
        throw new Error(json.error ?? "Could not start checkout.");
      }

      window.location.href = json.url;
    } catch (checkoutError: unknown) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Something went wrong."
      );
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <FormSection
        icon={<SchoolIcon />}
        eyebrow="Organization"
        title="School details"
        description="Add the information families and staff will recognize."
      >
        <Field
          name="schoolName"
          label="School name"
          placeholder="e.g. Horizon Academy"
          autoComplete="organization"
          required
        />
        <Field
          name="schoolEmail"
          label="School email"
          type="email"
          placeholder="hello@school.edu"
          autoComplete="email"
        />
        <Field
          name="phone"
          label="Phone"
          placeholder="School contact number"
          autoComplete="tel"
        />
        <Field
          name="website"
          label="Website"
          placeholder="www.yourschool.edu"
          autoComplete="url"
        />
        <Field
          name="address"
          label="Address"
          placeholder="Street, city, region"
          autoComplete="street-address"
          className="md:col-span-2"
        />
        <TextArea
          name="description"
          label="School description"
          placeholder="A short introduction to your school..."
          className="md:col-span-2"
        />
      </FormSection>

      <FormSection
        icon={<ShieldIcon />}
        eyebrow="Workspace owner"
        title="Admin account"
        description="These credentials unlock your new NeuraLearn workspace."
      >
        <Field
          name="username"
          label="Admin username"
          placeholder="Choose a username"
          autoComplete="username"
          required
        />
        <Field
          name="adminEmail"
          label="Admin email"
          type="email"
          placeholder="you@school.edu"
          autoComplete="email"
          required
        />
        <Field
          name="password"
          label="Password"
          type="password"
          placeholder="Create a secure password"
          autoComplete="new-password"
          required
          className="md:col-span-2"
        />
      </FormSection>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-600 dark:text-rose-300"
        >
          <svg className="mt-0.5 shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 17h.01" />
          </svg>
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 border-t border-line/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-ink-subtle">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          Encrypted and securely processed
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-w-52 px-6 py-3 disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              Preparing checkout
            </>
          ) : (
            <>
              Continue to checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="onboarding-form-section">
      <div className="mb-5 flex items-start gap-3">
        <span className="form-section-icon mt-0.5 h-10 w-10 rounded-xl">{icon}</span>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-brand">
            {eyebrow}
          </p>
          <h2 className="mt-0.5 text-base font-extrabold tracking-[-0.015em]">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-ink-muted">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  className,
  placeholder,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className={`modern-public-field ${className ?? ""}`}>
      <span>
        {label}
        {required ? <span className="ml-1 text-brand">*</span> : <span className="ml-1.5 text-[10px] font-medium text-ink-subtle">Optional</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="input-base"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  placeholder,
  className,
}: {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`modern-public-field ${className ?? ""}`}>
      <span>
        {label}
        <span className="ml-1.5 text-[10px] font-medium text-ink-subtle">Optional</span>
      </span>
      <textarea
        name={name}
        rows={3}
        placeholder={placeholder}
        className="input-base min-h-24 resize-y"
      />
    </label>
  );
}

function SchoolIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 10 9-6 9 6M5 9v10M19 9v10M3 20h18M9 13h6" /></svg>;
}

function ShieldIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 5 6v5c0 4.7 2.9 8.3 7 10 4.1-1.7 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}
