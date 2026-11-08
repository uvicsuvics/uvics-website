import React from "react";
import { toFailure } from "@/lib/backend/errors";
import { DashboardStatCard, type DashboardStatCardProps } from "./DashboardStatCard";

export interface DashboardKpiCardProps
  extends Omit<DashboardStatCardProps, "value" | "error"> {
  load: () => Promise<number>;
}

/**
 * Kartu KPI yang memuat angkanya sendiri di dalam Suspense.
 * Kegagalan hanya memengaruhi kartu ini dan hanya menampilkan pesan AppError.
 */
export async function DashboardKpiCard({ load, ...card }: DashboardKpiCardProps) {
  const result = await load().then(
    (value) => ({ value }),
    (error: unknown) => ({ value: null, error: toFailure(error).error.message }),
  );
  return <DashboardStatCard {...card} {...result} />;
}
