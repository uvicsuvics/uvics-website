import * as React from "react";
import { cn } from "@/lib/utils";

/** Textarea primitive dengan gaya yang sama seperti `Input`. */
export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-28 w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-base leading-relaxed text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-600 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error",
        className,
      )}
      {...props}
    />
  );
}
