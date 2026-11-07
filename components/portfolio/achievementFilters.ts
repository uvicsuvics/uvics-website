import { getYear } from '@/lib/format/date';
import { CONTENT_LEVEL_LABELS, toOptions } from '@/lib/format/labels';
import type { PortfolioFilterField } from '@/components/portfolio/PortfolioFilter';
import type { AchievementWithRelations } from '@/types/portfolio';

/** Field filter prestasi: Year, Level, Ranking. Category belum ada di data prestasi. */
export function getAchievementFilterFields(items: AchievementWithRelations[]): PortfolioFilterField[] {
  const years = [...new Set(items.map(({ achievement }) => getYear(achievement.achievementDate)))].sort(
    (a, b) => b - a,
  );
  const rankings = [...new Set(items.map(({ achievement }) => achievement.ranking))].sort((a, b) =>
    a.localeCompare(b, 'id'),
  );

  return [
    { id: 'year', label: 'Tahun', options: years.map((year) => ({ value: String(year), label: String(year) })) },
    { id: 'level', label: 'Level Kompetisi', options: toOptions(CONTENT_LEVEL_LABELS) },
    { id: 'ranking', label: 'Ranking', options: rankings.map((ranking) => ({ value: ranking, label: ranking })) },
  ];
}

/** Nilai kosong atau kunci yang tidak ada berarti "Semua". */
export function filterAchievements(
  items: AchievementWithRelations[],
  values: Record<string, string>,
): AchievementWithRelations[] {
  return items.filter(({ achievement }) => {
    if (values.year && String(getYear(achievement.achievementDate)) !== values.year) return false;
    if (values.level && achievement.level !== values.level) return false;
    if (values.ranking && achievement.ranking !== values.ranking) return false;
    return true;
  });
}
