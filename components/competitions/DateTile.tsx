import { formatDayMonth } from '@/lib/format/date';
import { cn } from '@/lib/utils';
import type { Competition, CompetitionStatus } from '@/types/competition';

/** Warna ubin per status, sama di linimasa dan halaman detail. */
export const STATUS_TILE_CLASS: Record<CompetitionStatus, string> = {
  OPEN: 'bg-primary text-white',
  UPCOMING: 'bg-primary-50 text-primary',
  ONGOING: 'bg-secondary text-gray-900',
  CLOSED: 'bg-muted text-gray-700',
  FINISHED: 'bg-muted text-gray-700',
};

interface CompetitionDates {
  /** Tanggal yang disorot di ubin; sama dengan kunci urutan grup di `groupCompetitions`. */
  primary: { label: string; date: string | null };
  secondary: { label: string; date: string | null };
}

/**
 * Batas pendaftaran disorot selama masih bisa didaftar (dibuka, segera dibuka);
 * setelah itu tanggal pelaksanaan.
 */
export function competitionDates({ status, registrationDeadline, competitionDate }: Competition): CompetitionDates {
  const deadline = { label: 'Batas pendaftaran', date: registrationDeadline };
  const event = { label: 'Pelaksanaan', date: competitionDate };
  return status === 'OPEN' || status === 'UPCOMING'
    ? { primary: deadline, secondary: event }
    : { primary: event, secondary: deadline };
}

interface DateTileProps {
  date: string | null;
  /** Dibacakan screen reader sebelum tanggal, mis. "Batas pendaftaran". */
  label: string;
  /** Sembunyikan dari screen reader bila tanggal lengkap sudah tertulis di sebelahnya. */
  decorative?: boolean;
  className?: string;
}

/**
 * Ubin hari dan bulan singkat; tanggal kosong ditampilkan "Belum ditentukan".
 * @param date - Tanggal YYYY-MM-DD
 * @param label - Arti tanggal untuk screen reader
 */
export function DateTile({ date, label, decorative = false, className }: DateTileProps) {
  const tile = date ? formatDayMonth(date) : null;
  return (
    <span
      aria-hidden={decorative || undefined}
      className={cn(
        'flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-lg leading-none',
        className,
      )}
    >
      {!decorative && <span className="sr-only">{label}</span>}
      {tile ? (
        <>
          <span className="text-[11px] font-bold uppercase">{tile.month}</span>
          <span className="font-heading text-2xl font-bold">{tile.day}</span>
        </>
      ) : (
        <span className="px-1 text-[11px] font-semibold text-center leading-tight">Belum ditentukan</span>
      )}
    </span>
  );
}
