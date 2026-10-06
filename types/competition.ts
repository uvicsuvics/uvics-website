export type CompetitionStatus =
  | 'UPCOMING'
  | 'OPEN'
  | 'CLOSED'
  | 'ONGOING'
  | 'FINISHED';

export type CompetitionLevel = 'Internal' | 'Nasional' | 'Internasional';

export interface Competition {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  description: string;
  category: string;
  level: CompetitionLevel;
  registrationDeadline: string | null;
  competitionDate: string;
  registrationUrl: string | null;
  guidebookUrl: string | null;
  poster: string | null;
  teamSize: string | null;
  eligibility: string | null;
  status: CompetitionStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionFilters {
  status?: CompetitionStatus | 'ALL';
  category?: string | 'ALL';
  level?: CompetitionLevel | 'ALL';
}
