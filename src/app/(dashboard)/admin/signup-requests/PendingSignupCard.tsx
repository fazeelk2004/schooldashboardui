"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  acceptStudentSignup,
  declineStudentSignup,
} from "@/lib/actions";

type StudentData = {
  username: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  bloodType: string;
  birthday: string;
  sex: "MALE" | "FEMALE";
  gradeId: number;
};

type ParentData = {
  username: string;
  name: string;
  surname: string;
  email?: string;
  phone: string;
  address: string;
};

type Request = {
  id: string;
  createdAt: string;
  studentData: StudentData;
  parentMode: "NEW" | "EXISTING" | "NONE";
  parentData?: ParentData | null;
  existingParentUsername?: string | null;
};

type ClassOption = {
  id: number;
  name: string;
  gradeId: number;
  capacity: number;
  studentCount: number;
};

type Grade = { id: number; level: number };

export default function PendingSignupCard({
  request,
  classes,
  grades,
}: {
  request: Request;
  classes: ClassOption[];
  grades: Grade[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [classId, setClassId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const grade = grades.find((g) => g.id === request.studentData.gradeId);
  const eligibleClasses = useMemo(
    () => classes.filter((c) => c.gradeId === request.studentData.gradeId),
    [classes, request.studentData.gradeId]
  );

  const accept = () => {
    setError(null);
    if (!classId) {
      setError("Please select a class for this student.");
      return;
    }
    startTransition(async () => {
      const res = await acceptStudentSignup(request.id, Number(classId));
      if (res.success) {
        toast("Application accepted");
        router.refresh();
      } else {
        setError(res.message ?? "Could not accept application.");
      }
    });
  };

  const decline = () => {
    setError(null);
    if (!confirm("Decline this application?")) return;
    startTransition(async () => {
      const res = await declineStudentSignup(request.id);
      if (res.success) {
        toast("Application declined");
        router.refresh();
      } else {
        setError(res.message ?? "Could not decline application.");
      }
    });
  };

  const s = request.studentData;

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-soft overflow-hidden">
      <div className="flex items-start justify-between border-b border-line px-5 py-4">
        <div>
          <div className="text-base font-semibold">
            {s.name} {s.surname}
          </div>
          <div className="text-xs text-ink-subtle">
            @{s.username} • {new Date(request.createdAt).toLocaleString()}
          </div>
        </div>
        <span className="chip">Pending</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 py-4 text-sm">
        <Detail label="Email" value={s.email || "—"} />
        <Detail label="Phone" value={s.phone || "—"} />
        <Detail label="Birthday" value={new Date(s.birthday).toLocaleDateString()} />
        <Detail label="Sex" value={s.sex} />
        <Detail label="Blood type" value={s.bloodType} />
        <Detail label="Grade" value={grade ? `Grade ${grade.level}` : `#${s.gradeId}`} />
        <Detail label="Address" value={s.address} full />
      </div>

      <div className="border-t border-line px-5 py-4 bg-surface-muted/40">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle mb-2">
          Parent / Guardian
        </div>
        {request.parentMode === "NEW" && request.parentData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <Detail
              label="Name"
              value={`${request.parentData.name} ${request.parentData.surname}`}
            />
            <Detail label="Username" value={request.parentData.username} />
            <Detail label="Email" value={request.parentData.email || "—"} />
            <Detail label="Phone" value={request.parentData.phone} />
            <Detail label="Address" value={request.parentData.address} full />
            <div className="md:col-span-2 text-xs text-ink-subtle">
              A new parent account will be created on acceptance.
            </div>
          </div>
        )}
        {request.parentMode === "EXISTING" && (
          <div className="text-sm">
            Link to existing parent{" "}
            <span className="font-medium">
              @{request.existingParentUsername}
            </span>
          </div>
        )}
        {request.parentMode === "NONE" && (
          <div className="text-sm text-ink-muted">No parent provided.</div>
        )}
      </div>

      <div className="border-t border-line px-5 py-4">
        <label className="block text-xs font-medium text-ink-muted mb-1.5">
          Assign class
        </label>
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          disabled={pending}
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
        >
          <option value="">
            {eligibleClasses.length === 0
              ? "No classes in this grade — create one first"
              : "— Pick a class —"}
          </option>
          {eligibleClasses.map((c) => (
            <option key={c.id} value={c.id} disabled={c.studentCount >= c.capacity}>
              {c.name} ({c.studentCount}/{c.capacity})
              {c.studentCount >= c.capacity ? " — full" : ""}
            </option>
          ))}
        </select>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-300/40 bg-rose-50/40 dark:bg-rose-900/10 px-3 py-2 text-xs text-rose-600">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={decline}
            disabled={pending}
            className="btn-ghost px-4 py-2 text-sm"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            disabled={pending || !classId}
            className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
          >
            {pending ? "Working…" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-[11px] uppercase tracking-wider text-ink-subtle">
        {label}
      </div>
      <div className="mt-0.5 text-ink">{value}</div>
    </div>
  );
}
