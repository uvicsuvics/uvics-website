import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** Ikuti spesifikasi §23, mis. "Belum ada kompetisi yang tersedia saat ini." */
  message: string;
  title?: string;
  /** Ikon lucide di atas judul; tanpa `icon` tidak ada ikon. */
  icon?: ComponentType<{ className?: string }>;
  /** Tindakan berikutnya, mis. tombol "Reset filter". */
  action?: ReactNode;
  className?: string;
}

/** Request berhasil tetapi tidak ada data, atau filter tanpa hasil. */
export function EmptyState({ message, title, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 px-6 py-16 text-center rounded-xl border border-dashed border-gray-300",
        className,
      )}
    >
      {Icon ? (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary">
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      ) : null}
      {title ? <h2 className="font-heading text-xl font-semibold text-gray-800">{title}</h2> : null}
      <p className="max-w-md text-gray-600">{message}</p>
      {action}
    </div>
  );
}
