import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { DateTile } from '@/components/competitions/DateTile';
import { EVENT_TILE_CLASS, EventStatusBadge } from '@/components/events/EventTimeline';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTimeRange, toWitaDate } from '@/lib/format/date';
import { cn } from '@/lib/utils';
import type { PublicEvent } from '@/types/event';

/**
 * Header detail event (Konsep A): breadcrumb, ubin tanggal, status, judul, jadwal WITA, lokasi,
 * tombol daftar, dan poster. Berisi satu-satunya h1 halaman.
 * @param event - Event yang ditampilkan
 */
export function EventDetailHeader({ event }: { event: PublicEvent }) {
  const { title, status, startAt, endAt, location, registrationUrl, poster } = event;
  const date = toWitaDate(startAt);
  const canRegister = registrationUrl !== null && (status === 'UPCOMING' || status === 'ONGOING');
  const facts = [
    { label: 'Tanggal', value: formatDate(date, 'long') },
    { label: 'Waktu', value: formatTimeRange(startAt, endAt) },
    ...(location ? [{ label: 'Lokasi', value: location }] : []),
  ];

  return (
    <section className="bg-primary-50 border-b border-primary-100">
      <div className="flex flex-col gap-10 mx-auto px-6 pt-28 pb-12 w-full max-w-7xl md:px-8 md:pt-32 lg:flex-row lg:items-center">
        <div className="flex flex-col flex-1 gap-5 min-w-0">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">/</li>
              <li>
                <Link href="/events" className="text-gray-600 transition-colors hover:text-primary">
                  Event
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">/</li>
              <li aria-current="page" className="font-semibold text-primary">{title}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-4">
            <DateTile date={date} label="Tanggal event" decorative className={cn('w-20 h-20', EVENT_TILE_CLASS[status])} />
            <EventStatusBadge status={status} />
          </div>

          <h1 className="font-heading text-4xl font-bold leading-tight text-primary-900 text-balance md:text-5xl">
            {title}
          </h1>

          <dl className="grid gap-4 p-5 bg-white rounded-xl border border-primary-100 sm:grid-cols-3">
            {facts.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5 min-w-0">
                <dt className="text-xs text-gray-600">{label}</dt>
                <dd className="font-semibold text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>

          {canRegister && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button href={registrationUrl} external variant="secondary" size="lg">
                Daftar sekarang
                <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
              <span className="text-sm text-gray-600">Formulir dibuka di tab baru</span>
            </div>
          )}
        </div>

        {poster && (
          <div className="relative w-full overflow-hidden aspect-[4/5] rounded-2xl lg:shrink-0 lg:w-[26rem]">
            <Image
              src={poster}
              alt={`Poster ${title}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 416px"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
