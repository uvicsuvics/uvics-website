import { UVICS_COMPETITIONS as competitions } from "@/src/data/mock/competitions";
import {
  applyLimit,
  findById,
  type ListOptions,
} from "@/src/services/utils/utils";

export type Competition = (typeof competitions)[number];

// SUMBER DATA: saat ini mock. Saat backend siap, ganti isi fungsi di bawah
// dengan fetch() dan biarkan signature-nya tetap.

export async function getCompetitions(
  options: ListOptions = {},
): Promise<Competition[]> {
  return applyLimit(competitions, options.limit);
}

export async function getCompetitionById(
  id: string | number,
): Promise<Competition | null> {
  return findById(competitions, id);
}
