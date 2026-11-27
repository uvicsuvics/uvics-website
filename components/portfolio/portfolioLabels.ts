import type { ProjectStatus } from '@/types/portfolio';

export interface PortfolioOption {
  value: string;
  label: string;
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { badgeClassName: string }> = {
  PLANNED: { badgeClassName: 'bg-accent/10 text-accent' },
  ONGOING: { badgeClassName: 'bg-warning/10 text-warning' },
  COMPLETED: { badgeClassName: 'bg-success/10 text-success' },
  ARCHIVED: { badgeClassName: 'bg-muted text-gray-600' },
};

/** Pengganti nama untuk member tertaut tanpa proyeksi nama publik (kontrak #11). */
export const MEMBER_NAME_FALLBACK = 'Anggota UVICS';

/**
 * Ringkasan anggota untuk kartu: nama yang ada (maks. `maxNames`), lalu jumlah sisanya
 * termasuk anggota tanpa nama.
 */
export function summarizeMembers(names: readonly (string | null)[], maxNames = names.length): string {
  const known = names.filter((name): name is string => name !== null).slice(0, maxNames);
  const rest = names.length - known.length;
  if (rest === 0) return known.join(', ');
  return known.length > 0 ? `${known.join(', ')} +${rest} lainnya` : `${rest} ${MEMBER_NAME_FALLBACK}`;
}

export type RankTier = 'gold' | 'silver' | 'bronze' | 'neutral';

const RANK_TIERS: Record<string, RankTier> = { '1': 'gold', '2': 'silver', '3': 'bronze' };

/** Tier warna dari teks ranking: "Juara 1" emas, "Juara 2" perak, "Juara 3" perunggu, selain itu netral. */
export function getRankTier(ranking: string): RankTier {
  const place = /^juara\s*([123])\b/i.exec(ranking.trim())?.[1];
  return place ? RANK_TIERS[place] : 'neutral';
}
