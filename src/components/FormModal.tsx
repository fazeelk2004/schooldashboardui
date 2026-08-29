"use client";

import {
  deleteClass,
  deleteExam,
  deleteSchool,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteAdmin,
  deleteParent,
  deleteLesson,
  deleteAssignment,
  deleteResult,
  deleteEvent,
  deleteAnnouncement,
  deleteGrade,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  school: deleteSchool,
  admin: deleteAdmin,
// TODO: OTHER DELETE ACTIONS
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteSubject,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  grade: deleteGrade,
};

// USE LAZY LOADING

const FormLoading = () => (
  <div className="space-y-5 py-2">
    <div className="h-7 w-52 animate-pulse rounded-lg bg-surface-subtle" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="space-y-2">
          <div className="h-2.5 w-20 animate-pulse rounded bg-surface-subtle" />
          <div className="h-11 animate-pulse rounded-xl bg-surface-subtle" />
        </div>
      ))}
    </div>
  </div>
);

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: FormLoading,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: FormLoading,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: FormLoading,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: FormLoading,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: FormLoading,
});
const SchoolForm = dynamic(() => import("./forms/SchoolForm"), {
  loading: FormLoading,
});
const AdminForm = dynamic(() => import("./forms/AdminForm"), {
  loading: FormLoading,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: FormLoading,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: FormLoading,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: FormLoading,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: FormLoading,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: FormLoading,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: FormLoading,
});
const GradeForm = dynamic(() => import("./forms/GradeForm"), {
  loading: FormLoading,
});
// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  school: (setOpen, type, data, relatedData) => (
    <SchoolForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  admin: (setOpen, type, data, relatedData) => (
    <AdminForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
    // TODO OTHER LIST ITEMS
  ),
  grade: (setOpen, type, data, relatedData) => (
    <GradeForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-9 h-9" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-brand text-white hover:opacity-90"
      : type === "update"
      ? "bg-brand-soft text-brand hover:bg-brand/20"
      : "bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className="flex flex-col gap-5 p-2">
        <input type="text | number" name="id" defaultValue={id} hidden />
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-rose-600 dark:text-rose-300"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-ink">
            Delete this {table}?
          </h3>
          <p className="text-sm text-ink-muted">
            This action cannot be undone. All related data will be permanently removed.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-subtle transition"
          >
            Cancel
          </button>
          <button className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition">
            Delete
          </button>
        </div>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        type="button"
        aria-label={type}
        className={`${size} flex items-center justify-center rounded-xl shadow-soft transition hover:-translate-y-0.5 hover:shadow-card ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={14} height={14} />
      </button>
      {open && (
        <div className="form-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-md sm:p-5" onMouseDown={() => setOpen(false)}>
          <div className="form-modal-panel relative max-h-[92vh] w-full overflow-y-auto rounded-[26px] border border-line/80 bg-surface p-5 shadow-2xl sm:p-7 md:w-[82%] lg:w-[72%] xl:w-[62%] 2xl:w-[54%]" onMouseDown={(event) => event.stopPropagation()}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/7 to-transparent" />
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-line/70 bg-surface/80 text-ink-muted shadow-sm backdrop-blur transition hover:rotate-90 hover:bg-surface-subtle hover:text-ink"
              onClick={() => setOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <Form />
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
