import type { CompetitionStatus } from '@/types/competition';
import type { EventStatus } from '@/types/event';
import type { ContentLevel, ProjectStatus } from '@/types/portfolio';

// Urutan key mengikuti Constants.public.Enums karena menjadi urutan opsi filter.
export const CONTENT_LEVEL_LABELS: Record<ContentLevel, string> = {
  INTERNAL: 'Internal',
  REGIONAL: 'Regional',
  NASIONAL: 'Nasional',
  INTERNASIONAL: 'Internasional',
};

export const COMPETITION_STATUS_LABELS: Record<CompetitionStatus, string> = {
  UPCOMING: 'Segera Dibuka',
  OPEN: 'Pendaftaran Dibuka',
  CLOSED: 'Pendaftaran Ditutup',
  ONGOING: 'Sedang Berlangsung',
  FINISHED: 'Selesai',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNED: 'Direncanakan',
  ONGOING: 'Berjalan',
  COMPLETED: 'Selesai',
  ARCHIVED: 'Diarsipkan',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  UPCOMING: 'Akan Datang',
  ONGOING: 'Sedang Berlangsung',
  FINISHED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

/** Ubah record label menjadi opsi filter dengan urutan key yang sama. */
export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
