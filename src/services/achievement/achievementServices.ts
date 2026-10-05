import { UVICS_ACHIEVEMENTS as achievements } from "@/src/data/mock/achievements";
import {
  applyLimit,
  findById,
  type ListOptions,
} from "@/src/services/utils/utils";

// Tipe diturunkan dari data, jadi komponen cukup impor tipe dari service ini.
export type Achievement = (typeof achievements)[number];

// SUMBER DATA: saat ini mock. Saat backend siap, ganti isi fungsi di bawah
// dengan fetch() dan biarkan signature-nya tetap. Pemanggil tidak perlu diubah.

export async function getAchievements(
  options: ListOptions = {},
): Promise<Achievement[]> {
  return applyLimit(achievements, options.limit);
}

export async function getAchievementById(
  id: string | number,
): Promise<Achievement | null> {
  return findById(achievements, id);
}

// Query khusus (mis. getAchievementsByYear) ditambahkan di sini,
// bukan di komponen.
