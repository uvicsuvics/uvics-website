import type { ContentLevel } from '@/types/portfolio';
import { Constants, type Enums } from '@/types/database';

export type CompetitionStatus = Enums<'competition_status'>;

/** Kode status kompetisi yang valid, dipakai UI tanpa mengimpor `@/types/database`. */
export const COMPETITION_STATUSES = Constants.public.Enums.competition_status;

/** Kolom `competitions` yang dipakai UI; tanggal berformat YYYY-MM-DD. */
export interface Competition {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  description: string;
  category: string | null;
  level: ContentLevel | null;
  registrationDeadline: string | null;
  competitionDate: string | null;
  registrationUrl: string | null;
  guidebookUrl: string | null;
  /** URL atau path siap next/image; pemetaan referensi media milik #26. */
  poster: string | null;
  teamSize: string | null;
  eligibility: string | null;
  status: CompetitionStatus;
  featured: boolean;
}

export interface CompetitionQuery {
  page?: number;
  page_size?: number;
  search?: string;
  status?: CompetitionStatus;
  featured?: boolean;
}

/** Urutan grup status di halaman kompetisi: yang masih bisa diikuti lebih dulu. */
export const COMPETITION_STATUS_ORDER: readonly CompetitionStatus[] = ['OPEN', 'UPCOMING', 'ONGOING', 'CLOSED', 'FINISHED'];

export interface CompetitionBoardFilters {
  search?: string;
  status?: CompetitionStatus;
  level?: ContentLevel;
  category?: string;
}

export interface CompetitionGroup {
  status: CompetitionStatus;
  items: Competition[];
}

/** Isi halaman /competitions: kompetisi per status beserta hitungan untuk filter. */
export interface CompetitionBoard {
  /** Urut `COMPETITION_STATUS_ORDER`; grup kosong tidak disertakan. */
  groups: CompetitionGroup[];
  /** Jumlah per status setelah filter pencarian, level, dan kategori (filter status diabaikan). */
  statusCounts: Record<CompetitionStatus, number>;
  total: number;
  /** Kompetisi dibuka dengan batas pendaftaran terdekat yang belum lewat, tanpa melihat filter. */
  nearestDeadline: Competition | null;
}
