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
    <div className={hidden ? "hidden" : "form-field flex w-full flex-col gap-2 md:w-[calc(50%_-_0.5rem)] lg:w-[calc(33.333%_-_0.667rem)]"}>
      <label htmlFor={`field-${name}`} className="text-[11px] font-bold uppercase tracking-[0.09em] text-ink-muted">{label}</label>
      <input
        id={`field-${name}`}
        type={type}
        {...register(name)}
        className={`w-full rounded-xl border bg-surface-muted/50 px-3.5 py-2.5 text-sm font-medium text-ink shadow-sm placeholder:font-normal placeholder:text-ink-subtle transition focus:bg-surface focus:outline-none focus:ring-4 ${
          error
            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10"
            : "border-line/90 hover:border-ink-subtle/50 focus:border-brand/60 focus:ring-brand/10"
        }`}
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500"><span className="h-1 w-1 rounded-full bg-current" />{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
