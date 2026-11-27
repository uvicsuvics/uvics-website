import React, { type ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface DashboardStatCardProps {
  title: string;
  /** null: sumber data belum ada, tampil "Belum tersedia" alih-alih angka. */
  value: string | number | null;
  /** Pesan aman bila data gagal dimuat; menggantikan nilai dan deskripsi. */
  error?: string;
  description?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  iconColorVariant?: "primary" | "accent" | "warning";
  className?: string;
}

const ICON_VARIANTS = {
  primary: "bg-primary-50 text-primary border-primary-100/60",
  accent: "bg-accent/10 text-accent border-accent/20",
  warning: "bg-warning/10 text-warning border-warning/20",
} as const;

export function DashboardStatCard({
  title,
  value,
  error,
  description,
  icon: Icon,
  iconColorVariant = "primary",
  className,
}: DashboardStatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 sm:p-5 shadow-xs transition-colors hover:border-gray-300",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-gray-500">{title}</span>
        <div
          className={cn(
            "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border",
            ICON_VARIANTS[iconColorVariant]
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      {error ? (
        <div role="alert" className="mt-2.5">
          <p className="text-sm font-semibold text-error">Gagal dimuat</p>
          <p className="mt-0.5 text-xs text-gray-500">{error}</p>
        </div>
      ) : (
        <div className="mt-2.5">
          {value === null ? (
            <p className="text-sm font-semibold text-gray-500">Belum tersedia</p>
          ) : (
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-sans tabular-nums">
              {value}
            </div>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
