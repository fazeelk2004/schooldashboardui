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

const initialExistingParent = {
  username: "",
  password: "",
};

export default function StudentSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("student");
  const [schools, setSchools] = useState<School[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [student, setStudent] = useState(initialStudent);
  const [parentMode, setParentMode] = useState<ParentMode>("NEW");
  const [newParent, setNewParent] = useState(initialNewParent);
  const [existingParent, setExistingParent] = useState(initialExistingParent);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/public/schools")
      .then((r) => r.json())
      .then((d) => setSchools(d.schools ?? []))
      .catch(() => setSchools([]));
  }, []);

  useEffect(() => {
    if (!schoolId) {
      setGrades([]);
      return;
    }
    fetch(`/api/public/grades?schoolId=${schoolId}`)
      .then((r) => r.json())
      .then((d) => setGrades(d.grades ?? []))
      .catch(() => setGrades([]));
  }, [schoolId]);

  const canContinueFromStudent = useMemo(() => {
    return (
      schoolId &&
      student.username.length >= 3 &&
      student.password.length >= 8 &&
      student.name &&
      student.surname &&
      student.address &&
      student.bloodType &&
      student.birthday &&
      student.gradeId
    );
  }, [schoolId, student]);

  const submitApplication = async () => {
    setError(null);
    setLoading(true);
    try {
      const body: any = {
        schoolId: Number(schoolId),
        student: {
          ...student,
          gradeId: Number(student.gradeId),
        },
        parentMode,
      };
      if (parentMode === "NEW") body.newParent = newParent;
      if (parentMode === "EXISTING") body.existingParent = existingParent;

      const res = await fetch("/api/public/student-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Could not submit application.");
      }
      router.push("/sign-up/student/success");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-soft">
      {/* progress */}
      <div className="flex items-center gap-2 border-b border-line px-6 py-4">
        <Pill active={step === "student"} label="1. Your details" />
        <span className="text-ink-subtle">›</span>
        <Pill active={step === "parent"} label="2. Parent info" />
        <span className="text-ink-subtle">›</span>
        <Pill active={step === "submitting"} label="3. Review" />
      </div>

      <div className="p-6 md:p-8">
        {step === "student" && (
          <div className="flex flex-col gap-6">
            <Section title="School">
              <FieldSelect
                label="Select your school"
                value={schoolId}
                onChange={setSchoolId}
                options={[
                  { value: "", label: "— Pick a school —" },
                  ...schools.map((s) => ({
                    value: String(s.id),
                    label: s.name,
                  })),
                ]}
              />
              <FieldSelect
                label="Grade"
                value={student.gradeId}
                onChange={(v) => setStudent({ ...student, gradeId: v })}
                disabled={!schoolId}
                options={[
                  { value: "", label: schoolId ? "— Pick a grade —" : "Select a school first" },
                  ...grades.map((g) => ({
                    value: String(g.id),
                    label: `Grade ${g.level}`,
                  })),
                ]}
              />
              <Hint>
                Your class will be assigned by the school admin once your
                application is approved.
              </Hint>
            </Section>

            <Section title="Account">
              <Field
                label="Username"
                value={student.username}
                onChange={(v) => setStudent({ ...student, username: v })}
              />
              <Field
                label="Password"
                type="password"
                value={student.password}
                onChange={(v) => setStudent({ ...student, password: v })}
              />
              <Field
                label="Email (optional)"
                type="email"
                value={student.email}
                onChange={(v) => setStudent({ ...student, email: v })}
              />
            </Section>

            <Section title="About you">
              <Field
                label="First name"
                value={student.name}
                onChange={(v) => setStudent({ ...student, name: v })}
              />
              <Field
                label="Last name"
                value={student.surname}
                onChange={(v) => setStudent({ ...student, surname: v })}
              />
              <Field
                label="Phone"
                value={student.phone}
                onChange={(v) => setStudent({ ...student, phone: v })}
              />
              <Field
                label="Birthday"
                type="date"
                value={student.birthday}
                onChange={(v) => setStudent({ ...student, birthday: v })}
              />
              <Field
                label="Address"
                value={student.address}
                onChange={(v) => setStudent({ ...student, address: v })}
                full
              />
              <Field
                label="Blood Type"
                value={student.bloodType}
                onChange={(v) => setStudent({ ...student, bloodType: v })}
              />
              <FieldSelect
                label="Sex"
                value={student.sex}
                onChange={(v) =>
                  setStudent({ ...student, sex: v as "MALE" | "FEMALE" })
                }
                options={[
                  { value: "MALE", label: "Male" },
                  { value: "FEMALE", label: "Female" },
                ]}
              />
            </Section>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={!canContinueFromStudent}
                onClick={() => setStep("parent")}
                className="btn-primary px-6 py-2.5 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "parent" && (
          <div className="flex flex-col gap-6">
            <Section title="Parent / Guardian">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                <ChoiceCard
                  label="New parent"
                  desc="Register a parent with this student."
                  active={parentMode === "NEW"}
                  onClick={() => setParentMode("NEW")}
                />
                <ChoiceCard
                  label="Existing parent"
                  desc="Link to a parent that already has an account."
                  active={parentMode === "EXISTING"}
                  onClick={() => setParentMode("EXISTING")}
                />
                <ChoiceCard
                  label="Skip for now"
                  desc="No parent / guardian to add."
                  active={parentMode === "NONE"}
                  onClick={() => setParentMode("NONE")}
                />
              </div>
            </Section>

            {parentMode === "NEW" && (
              <Section title="Parent details">
                <Field
                  label="Username"
                  value={newParent.username}
                  onChange={(v) =>
                    setNewParent({ ...newParent, username: v })
                  }
                />
                <Field
                  label="Password"
                  type="password"
                  value={newParent.password}
                  onChange={(v) =>
                    setNewParent({ ...newParent, password: v })
                  }
                />
                <Field
                  label="First name"
                  value={newParent.name}
                  onChange={(v) => setNewParent({ ...newParent, name: v })}
                />
                <Field
                  label="Last name"
                  value={newParent.surname}
                  onChange={(v) =>
                    setNewParent({ ...newParent, surname: v })
                  }
                />
                <Field
                  label="Email (optional)"
                  type="email"
                  value={newParent.email}
                  onChange={(v) => setNewParent({ ...newParent, email: v })}
                />
                <Field
                  label="Phone"
                  value={newParent.phone}
                  onChange={(v) => setNewParent({ ...newParent, phone: v })}
                />
                <Field
                  label="Address"
                  value={newParent.address}
                  onChange={(v) =>
                    setNewParent({ ...newParent, address: v })
                  }
                  full
                />
              </Section>
            )}

            {parentMode === "EXISTING" && (
              <Section title="Parent login">
                <Field
                  label="Parent username"
                  value={existingParent.username}
                  onChange={(v) =>
                    setExistingParent({ ...existingParent, username: v })
                  }
                />
                <Field
                  label="Parent password"
                  type="password"
                  value={existingParent.password}
                  onChange={(v) =>
                    setExistingParent({ ...existingParent, password: v })
                  }
                />
                <Hint>
                  We&apos;ll verify these credentials and link the parent to
                  this student once the admin accepts the application.
                </Hint>
              </Section>
            )}

            {error && (
              <div className="rounded-lg border border-rose-300/40 bg-rose-50/40 dark:bg-rose-900/10 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("student")}
                className="btn-ghost px-5 py-2.5"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={submitApplication}
                className="btn-primary px-6 py-2.5 disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Submit application"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`text-xs px-3 py-1 rounded-full ${
        active
          ? "bg-brand text-white"
          : "bg-surface-muted text-ink-subtle border border-line"
      }`}
    >
      {label}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle mb-3">
        {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
      />
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
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-muted">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition disabled:opacity-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p className="md:col-span-2 text-xs text-ink-subtle">{children}</p>
  );
}

function ChoiceCard({
  label,
  desc,
  active,
  onClick,
}: {
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border px-4 py-3 transition ${
        active
          ? "border-brand bg-brand-soft"
          : "border-line bg-surface hover:bg-surface-subtle"
      }`}
    >
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-ink-muted">{desc}</div>
    </button>
  );
}
