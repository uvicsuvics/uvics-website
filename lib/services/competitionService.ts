import { UVICS_COMPETITIONS, type CompetitionItem } from "@/data/mock/competitions";
import { applyLimit, findBySlug, type ListOptions } from "@/lib/services/shared";

// Sumber data sementara: mock. Saat backend siap, isi fungsi diganti query Supabase
// (ARCHITECTURE §4.1); signature tetap sehingga pemanggil tidak berubah.

export async function getCompetitions(options: ListOptions = {}): Promise<CompetitionItem[]> {
  return applyLimit(UVICS_COMPETITIONS, options.limit);
}

export async function getCompetitionBySlug(slug: string): Promise<CompetitionItem | null> {
  return findBySlug(UVICS_COMPETITIONS, slug);
}
