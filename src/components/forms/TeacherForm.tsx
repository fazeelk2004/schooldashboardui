"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>(
    data?.img ? { secure_url: data.img } : undefined
  );

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction({ ...data, img: img?.secure_url ?? "" });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects, schools, currentSchoolId } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold text-ink">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday?.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs font-medium text-ink-muted">Sex</label>
          <select
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-rose-500">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        {currentSchoolId ? (
          <input type="hidden" {...register("schoolId")} value={currentSchoolId} />
        ) : (
          <div className="flex flex-col gap-2 w-full md:w-1/4">
            <label className="text-xs font-medium text-ink-muted">School</label>
            <select
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
              {...register("schoolId")}
              defaultValue={data?.schoolId}
            >
              {schools.map((school: { id: number; name: string }) => (
                <option value={school.id} key={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            {errors.schoolId?.message && (
              <p className="text-xs text-rose-500">
                {errors.schoolId.message.toString()}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs font-medium text-ink-muted">Subjects</label>
          <select
            multiple
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition"
            {...register("subjects")}
            defaultValue={data?.subjects}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-rose-500">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <div className="flex flex-col gap-2 w-full md:w-1/4">
                {img?.secure_url ? (
                  <div className="flex items-center gap-3">
                    <Image
                      src={img.secure_url}
                      alt="Teacher photo"
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover ring-1 ring-gray-200"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => open()}
                        className="text-xs text-blue-500 hover:underline text-left"
                      >
                        Change photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setImg(undefined)}
                        className="text-xs text-red-500 hover:underline text-left"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-xs font-medium text-ink-muted flex items-center gap-2 cursor-pointer"
                    onClick={() => open()}
                  >
                    <Image src="/upload.png" alt="" width={28} height={28} />
                    <span>Upload a photo</span>
                  </div>
                )}
              </div>
            );
          }}
        </CldUploadWidget>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white shadow-soft hover:opacity-90 transition mt-2">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;
