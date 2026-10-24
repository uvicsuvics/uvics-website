// Bentuk data portfolio mengikuti tabel `achievements`, `projects`, `achievement_members`,
// dan `project_members` (supabase/migrations/20261004080000_content_foundation.sql),
// supaya mock bisa diganti data Supabase tanpa mengubah pemanggil.

export type ContentLevel = 'INTERNAL' | 'REGIONAL' | 'NASIONAL' | 'INTERNASIONAL';

export type ProjectStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';

/** Proyeksi publik member (D02): tanpa NIM, email, atau akses langsung ke tabel `members`. */
export interface Member {
  id: string;
  name: string;
}

export interface Achievement {
  id: string;
  slug: string;
  title: string;
  competitionName: string;
  organizer: string | null;
  level: ContentLevel | null;
  ranking: string;
  /** ISO date (YYYY-MM-DD). */
  achievementDate: string;
  description: string;
  coverImage: string | null;
  /** Project terkait (opsional). Belum ada kolomnya di schema; perlu migration saat backend diintegrasikan. */
  projectId: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  coverImage: string | null;
  projectUrl: string | null;
  repositoryUrl: string | null;
  /** ISO date (YYYY-MM-DD). */
  startDate: string | null;
  endDate: string | null;
  status: ProjectStatus;
  featured: boolean;
}

/**
 * Peserta yang tertaut ke prestasi atau project (D18): member terdaftar lewat `memberId`,
 * peserta non-member lewat `memberName`. Minimal salah satu terisi.
 */
interface Participation {
  id: string;
  memberId: string | null;
  memberName: string | null;
  role: string | null;
}

export interface AchievementMember extends Participation {
  achievementId: string;
}

export interface ProjectMember extends Participation {
  projectId: string;
}
