import { notFound } from 'next/navigation';
import { AppError } from '@/lib/backend/errors';
import { paginationMeta } from '@/lib/backend/validation';

export type SearchParams = Record<string, string | string[] | undefined>;
export type PageMeta = ReturnType<typeof paginationMeta>;
export interface Paginated<T> {
  items: T[];
  pagination: PageMeta;
}

/** Sama dengan default `paginationSchema` backend. */
export const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_SEARCH_LENGTH = 100;

function first(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Halaman dari query string; nilai selain bilangan bulat positif menjadi 1. */
export function readPage(params: SearchParams): number {
  const raw = first(params, 'page');
  return raw !== undefined && /^[1-9][0-9]*$/.test(raw) ? Number(raw) : 1;
}

/** Kata kunci pencarian: rapat, maksimal 100 karakter, kosong menjadi undefined. */
export function readSearch(params: SearchParams): string | undefined {
  const value = first(params, 'search')
    ?.trim()
    .replace(/\s+/g, ' ')
    .slice(0, MAX_SEARCH_LENGTH)
    .trim();
  return value || undefined;
}

/** Nilai parameter yang termasuk daftar `values`, selain itu undefined. */
export function readEnum<T extends string>(
  params: SearchParams,
  key: string,
  values: readonly T[],
): T | undefined {
  const raw = first(params, key);
  return values.find((value) => value === raw);
}

/**
 * Memotong daftar menjadi satu halaman dengan meta kontrak backend.
 * Melempar NOT_FOUND bila halaman melewati total (menyamai PostgREST PGRST103).
 */
export function paginate<T>(items: readonly T[], page: number, page_size: number): Paginated<T> {
  if (!Number.isInteger(page_size) || page_size < 1 || page_size > MAX_PAGE_SIZE) {
    throw new RangeError(`page_size harus bilangan bulat 1..${MAX_PAGE_SIZE}`);
  }
  if (!Number.isInteger(page) || page < 1) {
    throw new RangeError('page harus bilangan bulat positif');
  }
  const pagination = paginationMeta(page, page_size, items.length);
  if (page > 1 && page > pagination.total_pages) throw new AppError('NOT_FOUND');
  const start = (page - 1) * page_size;
  return { items: items.slice(start, start + page_size), pagination };
}

/** Mengubah NOT_FOUND dari sumber data menjadi 404 halaman; error lain dilempar ulang. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof AppError && error.code === 'NOT_FOUND') notFound();
    throw error;
  }
}
