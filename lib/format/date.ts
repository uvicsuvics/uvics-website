const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function assertDateOnly(date: string): void {
  // Datetime ditolak: new Date() pada zona waktu berbeda menggeser hari secara diam-diam.
  if (!DATE_ONLY.test(date)) throw new RangeError(`Tanggal harus berformat YYYY-MM-DD: ${date}`);
}

/** Tahun dari tanggal YYYY-MM-DD tanpa konversi zona waktu. */
export function getYear(date: string): number {
  return Number(date.slice(0, 4));
}

/** Format tanggal YYYY-MM-DD ke "14 Agu 2026" (short) atau "14 Agustus 2026" (long); UTC agar tidak bergeser. */
export function formatDate(date: string, month: 'short' | 'long' = 'short'): string {
  assertDateOnly(date);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month,
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

// en-CA memformat tanggal sebagai YYYY-MM-DD; UVICS berada di zona WITA (Asia/Makassar).
const WITA_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' });

/** Tanggal hari ini di WITA sebagai YYYY-MM-DD, untuk dibandingkan dengan kolom `date`. */
export function todayInWita(now: Date = new Date()): string {
  return WITA_DATE.format(now);
}

const WITA_DAY = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Makassar',
});

/** Tanggal kejadian `timestamptz` (ISO dengan offset) menurut WITA, mis. "8 Nov 2026". */
export function formatTimestamp(iso: string): string {
  return WITA_DAY.format(new Date(iso));
}

const DAY = new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: 'UTC' });
const SHORT_MONTH = new Intl.DateTimeFormat('id-ID', { month: 'short', timeZone: 'UTC' });

/** Hari dan bulan singkat dari tanggal YYYY-MM-DD untuk ubin tanggal, mis. { day: "5", month: "Okt" }. */
export function formatDayMonth(date: string): { day: string; month: string } {
  assertDateOnly(date);
  const value = new Date(date);
  return { day: DAY.format(value), month: SHORT_MONTH.format(value) };
}

const MONTH_YEAR = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "Agu 2025 – Mar 2026"; tanpa endDate menjadi "Agu 2025 – sekarang"; keduanya kosong menghasilkan null. */
export function formatPeriod(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  if (!start) return MONTH_YEAR.format(new Date(end as string));
  const from = MONTH_YEAR.format(new Date(start));
  return `${from} – ${end ? MONTH_YEAR.format(new Date(end)) : 'sekarang'}`;
}
