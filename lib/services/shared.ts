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

/** Peserta prestasi atau project (D18) menjadi anggota tim; baris tanpa nama dilewati. */
export function toTeamMembers(rows: readonly (AchievementMember | ProjectMember)[]): PortfolioTeamMember[] {
  return rows.flatMap((row) => (row.memberName ? [{ id: row.id, name: row.memberName, role: row.role }] : []));
}
