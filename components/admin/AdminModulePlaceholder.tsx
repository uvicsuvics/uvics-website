import React, { type ComponentType } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { cn } from "@/lib/utils";

export interface AdminModulePlaceholderProps {
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  message?: string;
  badge?: string;
  className?: string;
}

export function AdminModulePlaceholder({
  title,
  description,
  icon: Icon,
  message,
  badge = "Tahap Pengembangan CMS",
  className,
}: AdminModulePlaceholderProps) {
  const defaultMessage = `Modul pengelolaan ${title.toLowerCase()} akan tersedia pada tahap integrasi berikutnya.`;

  return (
    <div className={cn("space-y-6", className)}>
      <AdminPageHeader title={title} description={description} />

      <div className="rounded-xl border border-gray-200/80 bg-white p-8 sm:p-12 text-center shadow-xs">
        <div className="mx-auto flex max-w-md flex-col items-center">
          {Icon && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-primary">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          )}
          <span className="mb-2 inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
            {badge}
          </span>
          <h2 className="font-heading text-lg font-semibold text-gray-900 sm:text-xl">
            Modul {title}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-500 leading-relaxed">
            {message || defaultMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
