import type { ReactNode } from "react";

/** Atribut aksesibilitas yang dipasang ke kontrol di dalam `FormField`. */
export interface FieldControlProps {
  id: string;
  "aria-invalid": boolean;
  "aria-required"?: true;
  "aria-describedby"?: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Teks di kanan label, mis. penghitung karakter. */
  aside?: ReactNode;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/** Label, petunjuk, dan galat yang terhubung ke kontrol lewat `aria-describedby`. */
export function FormField({
  id,
  label,
  required,
  hint,
  error,
  aside,
  className,
  children,
}: FormFieldProps) {
  const described = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-gray-800">
          {label}
          {required ? (
            <span aria-hidden="true" className="text-error">
              {" "}
              *
            </span>
          ) : null}
        </label>
        {aside ? <span className="text-xs text-gray-600">{aside}</span> : null}
      </div>
      {children({
        id,
        "aria-invalid": !!error,
        // Tanda * disembunyikan dari pembaca layar, jadi status wajib diumumkan lewat atribut.
        "aria-required": required || undefined,
        "aria-describedby": described || undefined,
      })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-error">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-600">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
