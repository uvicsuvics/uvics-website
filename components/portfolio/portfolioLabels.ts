import type { ContentLevel, ProjectStatus } from '@/types/portfolio';

export interface PortfolioOption {
  value: string;
  label: string;
}

export const LEVEL_LABELS: Record<ContentLevel, string> = {
  INTERNAL: 'Internal',
  REGIONAL: 'Regional',
  NASIONAL: 'Nasional',
  INTERNASIONAL: 'Internasional',
};

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; badgeClassName: string }
> = {
  PLANNED: { label: 'Direncanakan', badgeClassName: 'bg-accent/10 text-accent' },
  ONGOING: { label: 'Berjalan', badgeClassName: 'bg-warning/10 text-warning' },
  COMPLETED: { label: 'Selesai', badgeClassName: 'bg-success/10 text-success' },
  ARCHIVED: { label: 'Diarsipkan', badgeClassName: 'bg-muted text-gray-600' },
};

export const LEVEL_OPTIONS: PortfolioOption[] = (
  Object.keys(LEVEL_LABELS) as ContentLevel[]
).map((value) => ({ value, label: LEVEL_LABELS[value] }));

export const PROJECT_STATUS_OPTIONS: PortfolioOption[] = (
  Object.keys(PROJECT_STATUS_CONFIG) as ProjectStatus[]
).map((value) => ({ value, label: PROJECT_STATUS_CONFIG[value].label }));

/** Tahun dari ISO date (YYYY-MM-DD) tanpa konversi zona waktu. */
export function getYear(isoDate: string): number {
  return Number(isoDate.slice(0, 4));
}

/** Format tanggal ISO ke "14 Agu 2026"; UTC agar tanggal tidak bergeser antar zona waktu. */
export function formatPortfolioDate(isoDate: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}

const MONTH_YEAR = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "Agu 2025 – Mar 2026"; tanpa endDate menjadi "Agu 2025 – sekarang"; keduanya kosong menghasilkan null. */
export function formatPortfolioPeriod(startDate: string | null, endDate: string | null): string | null {
  if (!startDate && !endDate) return null;
  if (!startDate) return MONTH_YEAR.format(new Date(endDate as string));
  const start = MONTH_YEAR.format(new Date(startDate));
  return `${start} – ${endDate ? MONTH_YEAR.format(new Date(endDate)) : 'sekarang'}`;
}
