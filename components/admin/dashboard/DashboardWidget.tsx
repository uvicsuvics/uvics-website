import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardWidgetProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function DashboardWidget({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: DashboardWidgetProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-gray-200/80 bg-white shadow-xs overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-4 sm:p-5 pb-3 sm:pb-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col justify-center p-4 sm:p-5 min-h-[140px]",
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
