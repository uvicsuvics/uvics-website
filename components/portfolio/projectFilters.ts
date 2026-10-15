import { PROJECT_STATUS_OPTIONS, getYear } from '@/components/portfolio/portfolioLabels';
import type { PortfolioFilterField } from '@/components/portfolio/PortfolioFilter';
import type { ProjectWithRelations } from '@/lib/services/portfolioService';
import type { Project } from '@/types/portfolio';

/** Tahun project = tahun startDate, atau endDate bila startDate kosong; null bila keduanya kosong. */
function getProjectYear({ startDate, endDate }: Project): number | null {
  const date = startDate ?? endDate;
  return date ? getYear(date) : null;
}

/** Field filter project: Tahun dan Status. Category belum ada di data project. */
export function getProjectFilterFields(items: ProjectWithRelations[]): PortfolioFilterField[] {
  const years = [
    ...new Set(items.flatMap(({ project }) => getProjectYear(project) ?? [])),
  ].sort((a, b) => b - a);

  return [
    { id: 'year', label: 'Tahun', options: years.map((year) => ({ value: String(year), label: String(year) })) },
    { id: 'status', label: 'Status', options: PROJECT_STATUS_OPTIONS },
  ];
}

/** Nilai kosong atau kunci yang tidak ada berarti "Semua". */
export function filterProjects(
  items: ProjectWithRelations[],
  values: Record<string, string>,
): ProjectWithRelations[] {
  return items.filter(({ project }) => {
    if (values.year && String(getProjectYear(project)) !== values.year) return false;
    if (values.status && project.status !== values.status) return false;
    return true;
  });
}
