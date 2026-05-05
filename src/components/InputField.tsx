import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-1.5 w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"}>
      <label className="text-xs font-medium text-ink-muted">{label}</label>
      <input
        type={type}
        {...register(name)}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 transition ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/40"
            : "border-line focus:border-brand focus:ring-brand/20"
        }`}
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-rose-500">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
