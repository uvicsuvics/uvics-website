import { cache } from "react";
import { UVICS_COMPETITIONS } from "@/data/mock/competitions";
import { normalizeSearch } from "@/lib/backend/content";
import { todayInWita } from "@/lib/format/date";
import { DEFAULT_PAGE_SIZE, paginate, type Paginated } from "@/lib/services/query";
import { findBySlug } from "@/lib/services/shared";
import {
  COMPETITION_STATUS_ORDER,
  type Competition,
  type CompetitionBoard,
  type CompetitionBoardFilters,
  type CompetitionGroup,
  type CompetitionQuery,
  type CompetitionStatus,
} from "@/types/competition";

// Sumber data sementara: mock. Saat backend siap, isi fungsi diganti query Supabase
// (ARCHITECTURE §4.1); signature tetap sehingga pemanggil tidak berubah.

function matchesSearch(competition: Competition, term: string | undefined): boolean {
  const search = term ? normalizeSearch(term).toLowerCase() : "";
  return (
    !search ||
    competition.title.toLowerCase().includes(search) ||
    competition.organizer.toLowerCase().includes(search)
  );
}

/**
 * Daftar kompetisi dengan filter dan pagination sesuai kontrak backend.
 * @throws AppError NOT_FOUND bila `page` melewati total halaman.
 */
export async function getCompetitions(query: CompetitionQuery = {}): Promise<Paginated<Competition>> {
  const items = UVICS_COMPETITIONS.filter(
    (c) =>
      matchesSearch(c, query.search) &&
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

// shortcut: halaman kompetisi mengambil semua kompetisi publik sekaligus (maks 100, batas page_size
// backend) lalu mengelompokkan di sini. Bila data melewati 100, ganti dengan query per status dan
// urutan tanggal di backend.
const BOARD_LIMIT = 100;

const listAllCompetitions = cache(
  async (): Promise<Competition[]> => (await getCompetitions({ page_size: BOARD_LIMIT })).items,
);

const ARCHIVED: readonly CompetitionStatus[] = ["CLOSED", "FINISHED"];

/** Tanggal YYYY-MM-DD naik; tanggal kosong selalu di akhir. */
function byDate(pick: (c: Competition) => string | null, descending = false) {
  return (a: Competition, b: Competition) => {
    const x = pick(a);
    const y = pick(b);
    if (x === y) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    return descending ? y.localeCompare(x) : x.localeCompare(y);
  };
}

function sortForStatus(status: CompetitionStatus) {
  if (status === "ONGOING") return byDate((c) => c.competitionDate);
  if (ARCHIVED.includes(status)) return byDate((c) => c.competitionDate, true);
  return byDate((c) => c.registrationDeadline);
}

/**
 * Kelompokkan kompetisi per status menurut `COMPETITION_STATUS_ORDER`.
 * Dibuka dan segera dibuka: batas pendaftaran terdekat dulu; berlangsung: pelaksanaan terdekat;
 * ditutup dan selesai: pelaksanaan terbaru dulu. Grup kosong dibuang.
 */
export function groupCompetitions(items: readonly Competition[]): CompetitionGroup[] {
  return COMPETITION_STATUS_ORDER.map((status) => ({
    status,
    items: items.filter((c) => c.status === status).sort(sortForStatus(status)),
  })).filter((group) => group.items.length > 0);
}

/**
 * Isi halaman /competitions: grup per status, hitungan status untuk filter, dan deadline terdekat.
 * @param options.today - Tanggal acuan YYYY-MM-DD (default hari ini WITA); batas yang sudah lewat
 *   tidak dijadikan deadline terdekat walau statusnya masih dibuka.
 */
export async function getCompetitionBoard(
  filters: CompetitionBoardFilters = {},
  { today = todayInWita() }: { today?: string } = {},
): Promise<CompetitionBoard> {
  const all = await listAllCompetitions();
  const matching = all.filter(
    (c) =>
      matchesSearch(c, filters.search) &&
      (filters.level === undefined || c.level === filters.level) &&
      (filters.category === undefined || c.category === filters.category),
  );
  const statusCounts = Object.fromEntries(
    COMPETITION_STATUS_ORDER.map((status) => [status, matching.filter((c) => c.status === status).length]),
  ) as Record<CompetitionStatus, number>;
  const shown = filters.status === undefined ? matching : matching.filter((c) => c.status === filters.status);
  const [nearestDeadline = null] = all
    .filter((c) => c.status === "OPEN" && c.registrationDeadline !== null && c.registrationDeadline >= today)
    .sort(byDate((c) => c.registrationDeadline));

  return { groups: groupCompetitions(shown), statusCounts, total: matching.length, nearestDeadline };
}

/** Kategori unik dari semua kompetisi publik, terurut alfabet, untuk pilihan filter. */
export async function getCompetitionCategories(): Promise<string[]> {
  const categories = (await listAllCompetitions()).flatMap((c) => (c.category ? [c.category] : []));
  return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
}
