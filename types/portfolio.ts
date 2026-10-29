// Bentuk data portfolio mengikuti tabel `achievements`, `projects`, `achievement_members`,
// dan `project_members` (supabase/migrations/20261004080000_content_foundation.sql),
// supaya mock bisa diganti data Supabase tanpa mengubah pemanggil.

export type ContentLevel = 'INTERNAL' | 'REGIONAL' | 'NASIONAL' | 'INTERNASIONAL';

export type ProjectStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';

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

/**
 * Anggota tim yang sudah digabung oleh service dari baris `achievement_members` atau `project_members`.
 * `name: null` berarti member tertaut tanpa proyeksi nama publik (kontrak #11, D02).
 */
export interface PortfolioTeamMember {
  id: string;
  memberId: string | null;
  name: string | null;
  role: string | null;
}

export interface AchievementWithRelations {
  achievement: Achievement;
  members: PortfolioTeamMember[];
  project: Project | null;
}

export interface ProjectWithRelations {
  project: Project;
  members: PortfolioTeamMember[];
  /** Prestasi yang `projectId`-nya menunjuk project ini, terbaru lebih dulu. */
  achievements: AchievementWithRelations[];
}
