import type { Paginated } from '@/lib/services/query';

/** Status event PRD §16; belum ada enum DB, jadi daftar ini kontrak sementara untuk backend. */
export const EVENT_STATUSES = ['UPCOMING', 'ONGOING', 'FINISHED', 'CANCELLED'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/** Kolom `events` PRD §46.2 yang dipakai UI; startAt/endAt ISO 8601 dengan offset, ditampilkan dalam WITA. */
export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string | null;
  startAt: string;
  endAt: string | null;
  registrationUrl: string | null;
  /** URL atau path siap next/image; pemetaan referensi media milik issue backend events. */
  poster: string | null;
  status: EventStatus;
  featured: boolean;
}

/** Isi halaman /events: event mendatang (tanpa pagination) dan event lampau per halaman. */
export interface EventBoard {
  /** UPCOMING dan ONGOING, mulai paling dekat dulu. */
  upcoming: PublicEvent[];
  /** FINISHED dan CANCELLED, paling baru dulu. */
  past: Paginated<PublicEvent>;
}
