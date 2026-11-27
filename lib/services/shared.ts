import type { AchievementMember, PortfolioTeamMember, ProjectMember } from "@/types/portfolio";

export interface ListOptions {
  /** Batasi jumlah item, mis. 3 untuk "prestasi terbaru" di beranda. */
  limit?: number;
}

export function applyLimit<T>(items: readonly T[], limit?: number): T[] {
  return limit && limit > 0 ? items.slice(0, limit) : [...items];
}

/** Null bila tidak ketemu, supaya halaman detail bisa memanggil notFound(). */
export function findBySlug<T extends { slug: string }>(items: readonly T[], slug: string): T | null {
  return items.find((item) => item.slug === slug) ?? null;
}

/** Peserta prestasi atau project (D18) menjadi anggota tim; member tertaut tanpa nama tetap dipertahankan. */
export function toTeamMembers(rows: readonly (AchievementMember | ProjectMember)[]): PortfolioTeamMember[] {
  return rows.map((row) => ({ id: row.id, name: row.memberName, role: row.role }));
}

/** Kelompokkan item per kunci, urutan input terjaga; kunci null dilewati. Untuk membangun relasi sekali, bukan filter per item. */
export function groupBy<T>(items: readonly T[], key: (item: T) => string | null): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    if (k === null) continue;
    const group = groups.get(k);
    if (group) group.push(item);
    else groups.set(k, [item]);
  }
  return groups;
}
