"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SEMESTER_MONTHS = 4;

const pad = (n: number) => String(n).padStart(2, "0");

const toTimeInput = (v: any) => {
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime())
    ? typeof v === "string" && v.includes(":")
      ? v.slice(0, 5)
      : ""
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDateInput = (v: any) => {
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime())
    ? ""
    : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const DAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const parseTime = (t: string | Date): [number, number] => {
  if (t instanceof Date) return [t.getHours(), t.getMinutes()];
  const [h, m] = t.split(":").map((v) => parseInt(v, 10));
  return [h || 0, m || 0];
};

const firstOccurrence = (semStart: Date, dayName: string): Date => {
  const target = DAY_INDEX[dayName] ?? 1;
  const d = new Date(semStart);
  const diff = (target - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return d;
};

const toDate = (v: any): Date =>
  v instanceof Date ? v : new Date(typeof v === "string" && v.length === 10 ? `${v}T00:00:00` : v);

const Field = ({
  label,
  children,
  error,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[11px] uppercase tracking-wide font-medium text-gray-500">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const defaultSemester = useMemo(() => {
    const start = data?.semesterStart ? new Date(data.semesterStart) : new Date();
    const end = data?.semesterEnd
      ? new Date(data.semesterEnd)
      : (() => {
          const e = new Date(start);
          e.setMonth(e.getMonth() + SEMESTER_MONTHS);
          return e;
        })();
    return { start, end };
  }, [data]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((d: any) => {
    const semesterStart = toDate(d.semesterStart);
    const semesterEnd = toDate(d.semesterEnd);

    if (isNaN(semesterStart.getTime()) || isNaN(semesterEnd.getTime())) {
      toast.error("Invalid semester dates");
      return;
    }

    const firstDay = firstOccurrence(semesterStart, d.day);

    const [sh, sm] = parseTime(d.startTime);
    const [eh, em] = parseTime(d.endTime);

    const startTime = new Date(firstDay);
    startTime.setHours(sh, sm, 0, 0);

    const endTime = new Date(firstDay);
    endTime.setHours(eh, em, 0, 0);

    formAction({
      ...d,
      startTime,
      endTime,
      semesterStart,
      semesterEnd,
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects, classes, teachers, schools, currentSchoolId } = relatedData;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-gray-900">
          {type === "create" ? "New Lesson" : "Edit Lesson"}
        </h1>
        <p className="text-xs font-medium text-ink-muted">
          This lesson repeats every week on the selected day from semester start to semester end.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Lesson details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Lesson name" error={errors?.name?.message?.toString()}>
            <input
              {...register("name")}
              defaultValue={data?.name}
              placeholder="e.g. Algebra"
              className={inputCls}
            />
          </Field>
          <Field label="Day of week" error={errors?.day?.message?.toString()}>
            <select {...register("day")} defaultValue={data?.day} className={inputCls}>
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
            </select>
          </Field>
          <Field label="Start time" error={errors?.startTime?.message?.toString()}>
            <input
              type="time"
              {...register("startTime")}
              defaultValue={data?.startTime ? toTimeInput(data.startTime) : ""}
              className={inputCls}
            />
          </Field>
          <Field label="End time" error={errors?.endTime?.message?.toString()}>
            <input
              type="time"
              {...register("endTime")}
              defaultValue={data?.endTime ? toTimeInput(data.endTime) : ""}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Semester window
          </h2>
          <span className="text-[11px] text-gray-400">Repeats weekly within this range</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Semester start"
            error={errors?.semesterStart?.message?.toString()}
          >
            <input
              type="date"
              {...register("semesterStart")}
              defaultValue={toDateInput(defaultSemester.start)}
              className={inputCls}
            />
          </Field>
          <Field
            label="Semester end"
            error={errors?.semesterEnd?.message?.toString()}
          >
            <input
              type="date"
              {...register("semesterEnd")}
              defaultValue={toDateInput(defaultSemester.end)}
              className={inputCls}
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Assignment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Subject" error={errors?.subjectId?.message?.toString()}>
            <select
              {...register("subjectId")}
              defaultValue={data?.subjectId}
              className={inputCls}
            >
              {subjects?.map((s: { id: number; name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Class" error={errors?.classId?.message?.toString()}>
            <select
              {...register("classId")}
              defaultValue={data?.classId}
              className={inputCls}
            >
              {classes?.map((c: { id: number; name: string }) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Teacher" error={errors?.teacherId?.message?.toString()}>
            <select
              {...register("teacherId")}
              defaultValue={data?.teacherId}
              className={inputCls}
            >
              {teachers?.map((t: { id: string; name: string; surname: string }) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.surname}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {currentSchoolId ? (
          <input type="hidden" {...register("schoolId")} defaultValue={currentSchoolId} />
        ) : (
          <Field
            label="School"
            error={errors?.schoolId?.message?.toString()}
            className="md:max-w-xs"
          >
            <select
              {...register("schoolId")}
              defaultValue={data?.schoolId}
              className={inputCls}
            >
              {schools?.map((s: { id: number; name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </section>

      {data && (
        <input type="hidden" {...register("id")} defaultValue={data?.id} />
      )}

      {state.error && (
        <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-black disabled:opacity-60 transition"
        >
          {type === "create" ? "Create lesson" : "Save changes"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm;
