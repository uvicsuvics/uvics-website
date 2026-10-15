import { LEVEL_OPTIONS, getYear } from '@/components/portfolio/portfolioLabels';
import type { PortfolioFilterField } from '@/components/portfolio/PortfolioFilter';
import type { AchievementWithRelations } from '@/lib/services/portfolioService';

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
    { id: 'level', label: 'Level Kompetisi', options: LEVEL_OPTIONS },
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
