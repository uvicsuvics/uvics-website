import * as React from "react";
import { cn } from "@/src/lib/utils";
/** Input primitive mengikuti pola shadcn, memakai token UVICS yang sudah ada. */
export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-base text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-600 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}
