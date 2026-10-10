import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

interface EmptyStateProps {
  /** Teks mengikuti standar spesifikasi bagian 23, contoh: "Belum ada kompetisi yang tersedia saat ini." */
  message: string;
  title?: string;
  /** Tindakan berikutnya, contoh tombol "Reset filter". */
  action?: ReactNode;
  className?: string;
}

/** State Empty: request sukses tetapi tidak ada data (atau filter tanpa hasil). */
export function EmptyState({
  message,
  title,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-16 text-center",
        className,
      )}
    >
      {title ? (
        <h2 className="font-heading text-xl font-semibold text-gray-800">
          {title}
        </h2>
      ) : null}
      <p className="max-w-md text-gray-600">{message}</p>
      {action}
    </div>
  );
}
