import { UVICS_ACHIEVEMENT_MEMBERS, UVICS_ACHIEVEMENTS } from "@/data/mock/achievements";
import { UVICS_PROJECTS } from "@/data/mock/projects";
import { applyLimit, findBySlug, toTeamMembers, type ListOptions } from "@/lib/services/shared";
import type { Achievement, AchievementWithRelations } from "@/types/portfolio";

// Sumber data sementara: mock relasional. Join dilakukan di sini, supaya halaman tidak berubah
// saat diganti query Supabase. Lihat competitionService.ts.

const PROJECTS_BY_ID = new Map(UVICS_PROJECTS.map((project) => [project.id, project]));

function toWithRelations(achievement: Achievement): AchievementWithRelations {
  return {
    achievement,
    members: toTeamMembers(UVICS_ACHIEVEMENT_MEMBERS.filter((row) => row.achievementId === achievement.id)),
    project: achievement.projectId ? (PROJECTS_BY_ID.get(achievement.projectId) ?? null) : null,
  };
}

/** Prestasi, terbaru lebih dulu. */
export async function getAchievements(options: ListOptions = {}): Promise<AchievementWithRelations[]> {
  const sorted = [...UVICS_ACHIEVEMENTS].sort((a, b) => b.achievementDate.localeCompare(a.achievementDate));
  return applyLimit(sorted, options.limit).map(toWithRelations);
}

export async function getAchievementBySlug(slug: string): Promise<AchievementWithRelations | null> {
  const achievement = findBySlug(UVICS_ACHIEVEMENTS, slug);
  return achievement ? toWithRelations(achievement) : null;
}

/** Prestasi lain dengan level atau tahun yang sama, terbaru lebih dulu. */
export async function getRelatedAchievements(slug: string, limit = 3): Promise<AchievementWithRelations[]> {
  const current = findBySlug(UVICS_ACHIEVEMENTS, slug);
  if (!current) return [];

  const currentYear = current.achievementDate.slice(0, 4);
  const all = await getAchievements();
  return all
    .filter(
      ({ achievement }) =>
        achievement.id !== current.id &&
        ((current.level !== null && achievement.level === current.level) ||
          achievement.achievementDate.startsWith(currentYear)),
    )
    .slice(0, limit);
}
