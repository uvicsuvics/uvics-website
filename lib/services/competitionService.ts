import { cache } from "react";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import { normalizeSearch } from "@/lib/backend/content";
import { DEFAULT_PAGE_SIZE, paginate, type Paginated } from "@/lib/services/query";
import { findBySlug } from "@/lib/services/shared";
import type { Competition, CompetitionQuery } from "@/types/competition";

// Sumber data sementara: mock. Saat backend siap, isi fungsi diganti query Supabase
// (ARCHITECTURE §4.1); signature tetap sehingga pemanggil tidak berubah.

/**
 * Daftar kompetisi dengan filter dan pagination sesuai kontrak backend.
 * @throws AppError NOT_FOUND bila `page` melewati total halaman.
 */
export async function getCompetitions(query: CompetitionQuery = {}): Promise<Paginated<Competition>> {
  const search = query.search ? normalizeSearch(query.search).toLowerCase() : "";
  const items = UVICS_COMPETITIONS.filter(
    (c) =>
      (!search || c.title.toLowerCase().includes(search) || c.organizer.toLowerCase().includes(search)) &&
      (query.status === undefined || c.status === query.status) &&
      (query.featured === undefined || c.featured === query.featured),
  );
  return paginate(items, query.page ?? 1, query.page_size ?? DEFAULT_PAGE_SIZE);
}

/** Dibungkus `cache` supaya `generateMetadata` dan page berbagi satu hasil per request. */
export const getCompetitionBySlug = cache(
  async (slug: string): Promise<Competition | null> => findBySlug(UVICS_COMPETITIONS, slug),
);

/** Kompetisi dengan kategori atau level sama, tanpa dirinya sendiri. */
export async function getRelatedCompetitions(slug: string, limit = 3): Promise<Competition[]> {
  const current = findBySlug(UVICS_COMPETITIONS, slug);
  if (!current) return [];
  return UVICS_COMPETITIONS.filter(
    (c) =>
      c.id !== current.id &&
      ((current.category !== null && c.category === current.category) ||
        (current.level !== null && c.level === current.level)),
  ).slice(0, limit);
}
