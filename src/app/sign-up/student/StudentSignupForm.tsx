"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type School = { id: number; name: string };
type Grade = { id: number; level: number };
type Step = "student" | "parent" | "submitting";
type ParentMode = "NEW" | "EXISTING" | "NONE";

const initialStudent = {
  username: "",
  password: "",
  name: "",
  surname: "",
  email: "",
  phone: "",
  address: "",
  bloodType: "",
  birthday: "",
  sex: "MALE" as "MALE" | "FEMALE",
  gradeId: "",
};

const initialNewParent = {
  username: "",
  password: "",
  name: "",
  surname: "",
  email: "",
  phone: "",
  address: "",
};

const initialExistingParent = { username: "", password: "" };

export default function StudentSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("student");
  const [schools, setSchools] = useState<School[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [student, setStudent] = useState(initialStudent);
  const [parentMode, setParentMode] = useState<ParentMode>("NEW");
  const [newParent, setNewParent] = useState(initialNewParent);
  const [existingParent, setExistingParent] = useState(initialExistingParent);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/public/schools")
      .then((response) => response.json())
      .then((data) => setSchools(data.schools ?? []))
      .catch(() => setSchools([]));
  }, []);

  useEffect(() => {
    if (!schoolId) {
      setGrades([]);
      return;
    }

    fetch(`/api/public/grades?schoolId=${schoolId}`)
      .then((response) => response.json())
      .then((data) => setGrades(data.grades ?? []))
      .catch(() => setGrades([]));
  }, [schoolId]);

  const canContinueFromStudent = useMemo(
    () =>
      Boolean(
        schoolId &&
          student.username.length >= 3 &&
          student.password.length >= 8 &&
          student.name &&
          student.surname &&
          student.address &&
          student.bloodType &&
          student.birthday &&
          student.gradeId
      ),
    [schoolId, student]
  );

  const submitApplication = async () => {
    setError(null);
    setLoading(true);
    setStep("submitting");

    try {
      const body: Record<string, unknown> = {
        schoolId: Number(schoolId),
        student: { ...student, gradeId: Number(student.gradeId) },
        parentMode,
      };

      if (parentMode === "NEW") body.newParent = newParent;
      if (parentMode === "EXISTING") body.existingParent = existingParent;

      const response = await fetch("/api/public/student-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "Could not submit application.");
      }

      router.push("/sign-up/student/success");
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong."
      );
      setLoading(false);
      setStep("parent");
    }
  };

  return (
    <form
      className="application-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!loading && step === "parent") void submitApplication();
      }}
    >
      <div className="application-progress">
        <ProgressStep
          number="1"
          label="Student"
          active={step === "student"}
          complete={step !== "student"}
        />
        <span className={`application-progress-line ${step !== "student" ? "is-complete" : ""}`} />
        <ProgressStep
          number="2"
          label="Guardian"
          active={step === "parent"}
          complete={step === "submitting"}
        />
        <span className={`application-progress-line ${step === "submitting" ? "is-complete" : ""}`} />
        <ProgressStep
          number="3"
          label="Submit"
          active={step === "submitting"}
          complete={false}
        />
      </div>

      <div className="p-5 sm:p-7 lg:p-8">
        {step === "student" && (
          <div className="form-step-enter space-y-7">
            <div>
              <span className="public-eyebrow">Step 1 of 2</span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.025em]">
                Tell us about yourself
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                Start with your school, then create your student profile.
              </p>
            </div>

            <Section title="School placement" icon={<SchoolIcon />}>
              <FieldSelect
                label="School"
                value={schoolId}
                onChange={setSchoolId}
                options={[
                  { value: "", label: "Select your school" },
                  ...schools.map((school) => ({
                    value: String(school.id),
                    label: school.name,
                  })),
                ]}
              />
              <FieldSelect
                label="Grade"
                value={student.gradeId}
                onChange={(value) => setStudent({ ...student, gradeId: value })}
                disabled={!schoolId}
                options={[
                  {
                    value: "",
                    label: schoolId ? "Select a grade" : "Select a school first",
                  },
                  ...grades.map((grade) => ({
                    value: String(grade.id),
                    label: `Grade ${grade.level}`,
                  })),
                ]}
              />
              <Hint>
                Your class will be assigned by the school after your application is approved.
              </Hint>
            </Section>

            <Section title="Account credentials" icon={<LockIcon />}>
              <Field
                label="Username"
                value={student.username}
                onChange={(value) => setStudent({ ...student, username: value })}
                autoComplete="username"
                hint="At least 3 characters"
              />
              <Field
                label="Password"
                type="password"
                value={student.password}
                onChange={(value) => setStudent({ ...student, password: value })}
                autoComplete="new-password"
                hint="At least 8 characters"
              />
              <Field
                label="Email"
                optional
                type="email"
                value={student.email}
                onChange={(value) => setStudent({ ...student, email: value })}
                autoComplete="email"
                full
              />
            </Section>

            <Section title="Personal information" icon={<UserIcon />}>
              <Field
                label="First name"
                value={student.name}
                onChange={(value) => setStudent({ ...student, name: value })}
                autoComplete="given-name"
              />
              <Field
                label="Last name"
                value={student.surname}
                onChange={(value) => setStudent({ ...student, surname: value })}
                autoComplete="family-name"
              />
              <Field
                label="Phone"
                value={student.phone}
                onChange={(value) => setStudent({ ...student, phone: value })}
                autoComplete="tel"
              />
              <Field
                label="Birthday"
                type="date"
                value={student.birthday}
                onChange={(value) => setStudent({ ...student, birthday: value })}
              />
              <Field
                label="Address"
                value={student.address}
                onChange={(value) => setStudent({ ...student, address: value })}
                autoComplete="street-address"
                full
              />
              <Field
                label="Blood type"
                value={student.bloodType}
                onChange={(value) => setStudent({ ...student, bloodType: value })}
                placeholder="e.g. O+"
              />
              <FieldSelect
                label="Sex"
                value={student.sex}
                onChange={(value) =>
                  setStudent({ ...student, sex: value as "MALE" | "FEMALE" })
                }
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                ]}
              />
            </Section>

            <div className="flex justify-end border-t border-line/70 pt-6">
              <button
                type="button"
                disabled={!canContinueFromStudent}
                onClick={() => {
                  setError(null);
                  setStep("parent");
                }}
                className="btn-primary min-w-36 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Continue
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}

        {step === "parent" && (
          <div className="form-step-enter space-y-7">
            <div>
              <span className="public-eyebrow">Step 2 of 2</span>
              <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.025em]">
                Add a parent or guardian
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                Choose the option that matches your family&apos;s account setup.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <ChoiceCard
                label="New parent"
                description="Create a linked guardian account."
                active={parentMode === "NEW"}
                onClick={() => setParentMode("NEW")}
              />
              <ChoiceCard
                label="Existing parent"
                description="Connect an account already in use."
                active={parentMode === "EXISTING"}
                onClick={() => setParentMode("EXISTING")}
              />
              <ChoiceCard
                label="Skip for now"
                description="Continue without a guardian account."
                active={parentMode === "NONE"}
                onClick={() => setParentMode("NONE")}
              />
            </div>

            {parentMode === "NEW" && (
              <Section title="Guardian profile" icon={<UsersIcon />}>
                <Field
                  label="Username"
                  value={newParent.username}
                  onChange={(value) => setNewParent({ ...newParent, username: value })}
                  autoComplete="username"
                />
                <Field
                  label="Password"
                  type="password"
                  value={newParent.password}
                  onChange={(value) => setNewParent({ ...newParent, password: value })}
                  autoComplete="new-password"
                />
                <Field
                  label="First name"
                  value={newParent.name}
                  onChange={(value) => setNewParent({ ...newParent, name: value })}
                  autoComplete="given-name"
                />
                <Field
                  label="Last name"
                  value={newParent.surname}
                  onChange={(value) => setNewParent({ ...newParent, surname: value })}
                  autoComplete="family-name"
                />
                <Field
                  label="Email"
                  optional
                  type="email"
                  value={newParent.email}
                  onChange={(value) => setNewParent({ ...newParent, email: value })}
                  autoComplete="email"
                />
                <Field
                  label="Phone"
                  value={newParent.phone}
                  onChange={(value) => setNewParent({ ...newParent, phone: value })}
                  autoComplete="tel"
                />
                <Field
                  label="Address"
                  value={newParent.address}
                  onChange={(value) => setNewParent({ ...newParent, address: value })}
                  autoComplete="street-address"
                  full
                />
              </Section>
            )}

            {parentMode === "EXISTING" && (
              <Section title="Guardian sign-in" icon={<LockIcon />}>
                <Field
                  label="Parent username"
                  value={existingParent.username}
                  onChange={(value) =>
                    setExistingParent({ ...existingParent, username: value })
                  }
                  autoComplete="username"
                />
                <Field
                  label="Parent password"
                  type="password"
                  value={existingParent.password}
                  onChange={(value) =>
                    setExistingParent({ ...existingParent, password: value })
                  }
                  autoComplete="current-password"
                />
                <Hint>
                  We&apos;ll verify the account before linking it to this student.
                </Hint>
              </Section>
            )}

            {parentMode === "NONE" && (
              <div className="rounded-2xl border border-dashed border-line bg-surface-muted/60 p-6 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                  <UserIcon />
                </div>
                <p className="mt-3 text-sm font-bold">Student-only application</p>
                <p className="mt-1 text-xs leading-5 text-ink-muted">
                  A guardian can be added later by the school administrator.
                </p>
              </div>
            )}

            {error && <Alert message={error} />}

            <div className="flex flex-col-reverse gap-3 border-t border-line/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setStep("student")}
                className="btn-ghost px-5 py-3"
              >
                <ArrowLeftIcon />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-3 disabled:cursor-wait disabled:opacity-60"
              >
                Submit application
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}

        {step === "submitting" && (
          <div className="form-step-enter flex min-h-[460px] flex-col items-center justify-center text-center">
            <div className="public-loader" aria-hidden="true">
              <span />
            </div>
            <span className="public-eyebrow mt-8">Secure submission</span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.025em]">
              Sending your application
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">
              We&apos;re securely sharing your details with the selected school.
              Please keep this page open.
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

function ProgressStep({
  number,
  label,
  active,
  complete,
}: {
  number: string;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className={`application-progress-step ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}>
      <span className="application-progress-number">
        {complete ? <CheckIcon /> : number}
      </span>
      <span className="hidden text-[11px] font-bold sm:block">{label}</span>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="form-section-card">
      <legend className="flex items-center gap-2 px-2 text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">
        <span className="form-section-icon">{icon}</span>
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  full,
  optional,
  hint,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  full?: boolean;
  optional?: boolean;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className={`modern-public-field ${full ? "md:col-span-2" : ""}`}>
      <span className="flex items-center justify-between gap-2">
        <span>{label}</span>
        {optional && <span className="text-[10px] font-medium text-ink-subtle">Optional</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="input-base"
      />
      {hint && <span className="text-[10px] font-medium text-ink-subtle">{hint}</span>}
    </label>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="modern-public-field">
      <span>{label}</span>
      <span className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="input-base appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-5 text-ink-subtle md:col-span-2">
      <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
      {children}
    </p>
  );
}

function ChoiceCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`guardian-choice ${active ? "is-active" : ""}`}
    >
      <span className="guardian-choice-radio">
        {active && <span />}
      </span>
      <span className="block text-sm font-bold text-ink">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-ink-muted">{description}</span>
    </button>
  );
}

function Alert({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
      <svg className="mt-0.5 shrink-0" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v6M12 17h.01" />
      </svg>
      {message}
    </div>
  );
}

function ArrowRightIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function ArrowLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>;
}

function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>;
}

function SchoolIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 10 9-6 9 6M5 9v10M19 9v10M3 20h18M9 13h6" /></svg>;
}

function LockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}

function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>;
}

function UsersIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 20a6 6 0 0 0-12 0M10 11a4 4 0 1 0 0-8M17 11a3 3 0 1 0 0-6M19 20a5 5 0 0 0-4-4.58" /></svg>;
}
