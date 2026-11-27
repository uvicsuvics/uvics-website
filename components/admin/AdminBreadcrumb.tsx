"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminBreadcrumbs } from "@/config/admin-navigation";

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = getAdminBreadcrumbs(pathname);
  const currentCrumb = breadcrumbs[breadcrumbs.length - 1];

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      {/* Mobile: compact current page label */}
      <div className="sm:hidden font-semibold text-xs text-gray-800 truncate max-w-[140px]">
        {currentCrumb?.label || "Admin"}
      </div>

      {/* Desktop & Tablet: full hierarchical breadcrumb */}
      <ol className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <li key={crumb.href || idx} className="flex items-center gap-1.5 min-w-0">
              {idx > 0 && (
                <span className="text-gray-300 select-none" aria-hidden="true">
                  /
                </span>
              )}
              {isLast ? (
                <span
                  className="font-semibold text-gray-800 truncate max-w-[180px]"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href || "#"}
                  className="font-medium text-gray-400 hover:text-gray-600 transition-colors truncate max-w-[140px]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
