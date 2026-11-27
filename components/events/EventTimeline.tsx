import type { ReactNode } from 'react';
import Link from 'next/link';
import { CalendarX, Clock, MapPin } from 'lucide-react';
import { DateTile } from '@/components/competitions/DateTile';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatTimeRange, toWitaDate } from '@/lib/format/date';
import { EVENT_STATUS_LABELS } from '@/lib/format/labels';
import type { EventStatus, PublicEvent } from '@/types/event';

/** Warna ubin tanggal per status, sama di linimasa dan halaman detail. */
export const EVENT_TILE_CLASS: Record<EventStatus, string> = {
  UPCOMING: 'bg-primary text-white',
  ONGOING: 'bg-secondary text-gray-900',
  FINISHED: 'bg-muted text-gray-700',
  CANCELLED: 'bg-muted text-gray-700',
};

const BADGE_CLASS: Record<EventStatus, string> = {
  UPCOMING: '',
  ONGOING: 'bg-secondary/15 text-gray-800',
  FINISHED: 'bg-muted text-gray-700',
  CANCELLED: 'bg-secondary/15 text-gray-800',
};

/** Badge status event dengan label dari `EVENT_STATUS_LABELS`. */
export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge className={BADGE_CLASS[status]}>{EVENT_STATUS_LABELS[status]}</Badge>;
}

/**
 * Satu baris linimasa event: ubin tanggal, judul, jadwal WITA, lokasi, status, dan tautan detail.
 * @param event - Event yang ditampilkan
 */
export function EventTimelineRow({ event }: { event: PublicEvent }) {
  const { slug, title, location, startAt, endAt, status } = event;
  const date = toWitaDate(startAt);

  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 border-b border-gray-200/90">
      <DateTile date={date} label="Tanggal event" decorative className={EVENT_TILE_CLASS[status]} />

      <div className="flex flex-col flex-1 gap-1 min-w-0 basis-64">
        <h3 className="text-base font-semibold leading-snug text-gray-900">
          <Link href={`/events/${slug}`} className="transition-colors hover:text-primary">
            {title}
          </Link>
        </h3>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
            {`${formatDate(date)}, ${formatTimeRange(startAt, endAt)}`}
          </span>
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              {location}
            </span>
          )}
        </p>
      </div>

      <EventStatusBadge status={status} />
      <Button href={`/events/${slug}`} variant="outline" size="sm" aria-label={`Lihat detail ${title}`}>
        Detail
      </Button>
    </li>
  );
}

interface EventTimelineSectionProps {
  /** id section (anchor); h2 memakai `${id}-heading`. */
  id: string;
  title: string;
  events: PublicEvent[];
  /** Jumlah total event di grup ini; bisa lebih dari `events` bila berhalaman. */
  count?: number;
  /** Pesan empty state bila `events` kosong (spesifikasi §23). */
  emptyMessage?: string;
  /** Pengganti jumlah di kanan judul, mis. tautan "Semua event". */
  action?: ReactNode;
  /** Isi di bawah daftar, mis. pagination. */
  children?: ReactNode;
}

/**
 * Grup event bergaya linimasa kompetisi (Konsep A): judul Playfair bergaris tebal lalu baris event.
 */
export function EventTimelineSection({
  id,
  title,
  events,
  count,
  emptyMessage,
  action,
  children,
}: EventTimelineSectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="flex flex-col scroll-mt-28">
      <div className="flex items-baseline justify-between gap-3 pb-2.5 border-b-2 border-gray-900">
        <h2 id={headingId} className="font-heading text-2xl font-bold text-gray-900">
          {title}
        </h2>
        {action ?? (count !== undefined && <span className="text-sm text-gray-500">{`${count} event`}</span>)}
      </div>
      {events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <EventTimelineRow key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        emptyMessage && <EmptyState icon={CalendarX} message={emptyMessage} className="mt-6" />
      )}
      {children}
    </section>
  );
}
