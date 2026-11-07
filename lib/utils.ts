import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Href daftar tanpa nilai kosong dan tanpa `page` 1, urutan key dipertahankan. */
export function listHref(
  pathname: string,
  params: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || (key === 'page' && Number(value) === 1)) continue;
    query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
