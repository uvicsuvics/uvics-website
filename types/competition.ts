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
