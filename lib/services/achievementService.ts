import { UVICS_ACHIEVEMENTS, type AchievementItem } from "@/data/mock/achievements";
import { applyLimit, findBySlug, type ListOptions } from "@/lib/services/shared";

// Sumber data sementara: mock. Lihat competitionService.ts.

export async function getAchievements(options: ListOptions = {}): Promise<AchievementItem[]> {
  return applyLimit(UVICS_ACHIEVEMENTS, options.limit);
}

export async function getAchievementBySlug(slug: string): Promise<AchievementItem | null> {
  return findBySlug(UVICS_ACHIEVEMENTS, slug);
}
