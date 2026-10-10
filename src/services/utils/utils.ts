/**
 * Helper bersama untuk semua service.
 * Tidak boleh mengimpor apa pun dari data/ di sini.
 */

export type ListOptions = {
  /** Batasi jumlah item, mis. 3 untuk "3 prestasi terbaru" di beranda. */
  limit?: number;
};

export function applyLimit<T>(items: readonly T[], limit?: number): T[] {
  return limit && limit > 0 ? items.slice(0, limit) : [...items];
}

/** Mengembalikan null kalau tidak ketemu, supaya halaman bisa memanggil notFound(). */
export function findById<T extends { id: string | number }>(
  items: readonly T[],
  id: string | number,
): T | null {
  return items.find((item) => String(item.id) === String(id)) ?? null;
}
