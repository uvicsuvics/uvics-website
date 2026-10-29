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
  return rows.map((row) => ({ id: row.id, memberId: row.memberId, name: row.memberName, role: row.role }));
}
