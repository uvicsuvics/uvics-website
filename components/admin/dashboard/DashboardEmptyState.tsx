import React, { type ComponentType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardEmptyStateProps {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-4 px-3 text-center",
        className
      )}
    >
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/70 bg-gray-50 text-gray-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="text-xs sm:text-sm font-medium text-gray-700">{title}</p>
      {description && (
        <p className="mt-0.5 max-w-xs text-xs leading-relaxed text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}
