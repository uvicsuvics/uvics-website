import type { ReactNode } from "react";
import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Umpan balik hasil aksi: sukses diumumkan sopan (`status`), galat langsung (`alert`). */
export function CmsBanner({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  const Icon = tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm text-gray-900",
        tone === "success"
          ? "border-success/30 bg-success/10"
          : "border-error/30 bg-error/5",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "success" ? "text-success" : "text-error",
        )}
      />
      <span>{children}</span>
    </div>
  );
}
