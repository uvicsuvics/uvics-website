import {
  MOCK_ACHIEVEMENT_MEMBERS,
  MOCK_ACHIEVEMENTS,
  MOCK_MEMBERS,
  MOCK_PROJECTS,
} from '@/data/mock/portfolio';
import { findBySlug } from '@/lib/services/shared';
import type { Achievement, Project } from '@/types/portfolio';

// Sumber data sementara: mock relasional (data/mock/portfolio.ts). Join dilakukan di sini,
// supaya halaman tidak berubah saat diganti query Supabase.

export interface AchievementTeamMember {
  id: string;
  name: string;
  role: string | null;
}

export interface AchievementWithRelations {
  achievement: Achievement;
  members: AchievementTeamMember[];
  project: Project | null;
}

const MEMBER_NAMES = new Map(MOCK_MEMBERS.map((member) => [member.id, member.name]));
const PROJECTS_BY_ID = new Map(MOCK_PROJECTS.map((project) => [project.id, project]));

function toWithRelations(achievement: Achievement): AchievementWithRelations {
  const members = MOCK_ACHIEVEMENT_MEMBERS.filter((row) => row.achievementId === achievement.id).flatMap(
    (row) => {
      // D18: member terdaftar lewat memberId, peserta non-member lewat memberName.
      const name = (row.memberId ? MEMBER_NAMES.get(row.memberId) : null) ?? row.memberName;
      return name ? [{ id: row.id, name, role: row.role }] : [];
    },
  );

  return {
    achievement,
    members,
    project: achievement.projectId ? (PROJECTS_BY_ID.get(achievement.projectId) ?? null) : null,
  };
}

/** Semua prestasi, terbaru lebih dulu. */
export async function listAchievements(): Promise<AchievementWithRelations[]> {
  return [...MOCK_ACHIEVEMENTS]
    .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))
    .map(toWithRelations);
}

/** Null bila tidak ketemu, supaya halaman detail bisa memanggil notFound(). */
export async function getAchievementDetail(slug: string): Promise<AchievementWithRelations | null> {
  const achievement = findBySlug(MOCK_ACHIEVEMENTS, slug);
  return achievement ? toWithRelations(achievement) : null;
}

/** Prestasi lain dengan level atau tahun yang sama, terbaru lebih dulu. */
export async function getRelatedAchievements(
  slug: string,
  limit = 3,
): Promise<AchievementWithRelations[]> {
  const current = findBySlug(MOCK_ACHIEVEMENTS, slug);
  if (!current) return [];

  const currentYear = current.achievementDate.slice(0, 4);
  const all = await listAchievements();
  return all
    .filter(
      ({ achievement }) =>
        achievement.id !== current.id &&
        ((current.level !== null && achievement.level === current.level) ||
          achievement.achievementDate.startsWith(currentYear)),
    )
    .slice(0, limit);
}
