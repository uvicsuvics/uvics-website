import React from "react";
import { cn } from "@/lib/utils";

/** Skeleton satu kartu KPI; juga fallback Suspense per kartu. */
export function DashboardStatCardSkeleton() {
  return (
    <div
      role="status"
      className="flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-4 sm:p-5"
    >
      <span className="sr-only">Memuat indikator</span>
      <div className="flex items-center justify-between gap-2">
        <div className="h-3.5 w-24 rounded bg-gray-200/70 animate-pulse" />
        <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-lg bg-gray-100 animate-pulse" />
      </div>
      <div className="mt-2.5">
        <div className="h-7 w-12 rounded bg-gray-200 animate-pulse" />
        <div className="mt-1.5 h-3 w-28 rounded bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

/** Skeleton isi widget; juga fallback Suspense di dalam DashboardWidget. */
export function DashboardWidgetBodySkeleton() {
  return (
    <div role="status" className="flex flex-col items-center justify-center">
      <span className="sr-only">Memuat data</span>
      <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
      <div className="mt-2.5 h-3.5 w-40 rounded bg-gray-100 animate-pulse" />
      <div className="mt-1 h-3 w-56 rounded bg-gray-50 animate-pulse" />
    </div>
  );
}

const WIDGETS = [
  { span: "lg:col-span-7", title: "w-36" },
  { span: "lg:col-span-5", title: "w-32" },
  { span: "lg:col-span-6", title: "w-32" },
  { span: "lg:col-span-6", title: "w-32" },
  { span: "lg:col-span-12", title: "w-44" },
];

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat dashboard">
      {/* Header Skeleton */}
      <div className="pb-2">
        <div className="h-7 w-36 rounded-md bg-gray-200 animate-pulse" />
        <div className="mt-1.5 h-3.5 w-60 rounded-md bg-gray-100 animate-pulse sm:w-80" />
      </div>

      {/* KPI Cards Skeleton (6 cards) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <DashboardStatCardSkeleton key={idx} />
        ))}
      </div>

      {/* Main Grid Skeleton (5 widgets) */}
      <div className="grid grid-cols-1 gap-5 pt-1 lg:grid-cols-12">
        {WIDGETS.map((widget, idx) => (
          <div
            key={idx}
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white",
              widget.span
            )}
          >
            <div className="border-b border-gray-100 p-4 sm:p-5 pb-3">
              <div className={cn("h-4 rounded bg-gray-200/80 animate-pulse", widget.title)} />
              <div className="mt-1 h-3 w-52 rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="flex min-h-[140px] flex-col items-center justify-center p-4 sm:p-5">
              <DashboardWidgetBodySkeleton />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
