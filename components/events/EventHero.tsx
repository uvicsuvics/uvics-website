import Link from 'next/link';
import { DateTile } from '@/components/competitions/DateTile';
import { formatTimeRange, toWitaDate } from '@/lib/format/date';
import type { PublicEvent } from '@/types/event';

interface EventHeroProps {
  /** Event mendatang paling dekat; null bila tidak ada. */
  nearest: PublicEvent | null;
}

/**
 * Header halaman event (Konsep A): breadcrumb, judul, dan pintasan ke event terdekat.
 * @param nearest - Event mendatang paling dekat
 */
export function EventHero({ nearest }: EventHeroProps) {
  return (
    <section className="bg-primary-50 border-b border-primary-100">
      <div className="flex flex-col gap-8 mx-auto px-6 pt-28 pb-10 w-full max-w-7xl md:px-8 md:pt-32 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 min-w-0 max-w-2xl">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
            <ol className="flex flex-wrap items-center gap-x-2">
              <li>
                <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-400">/</li>
              <li aria-current="page" className="font-semibold text-primary">Event</li>
            </ol>
          </nav>
          <h1 className="font-heading text-4xl font-bold leading-tight text-primary-900 md:text-5xl">
            Event &amp; Kegiatan
          </h1>
          <p className="text-base leading-relaxed text-gray-700">
            Agenda webinar, kelas, dan kegiatan anggota UVICS. Event yang akan datang diurutkan dari tanggal terdekat.
          </p>
        </div>

        {nearest && (
          <Link
            href={`/events/${nearest.slug}`}
            className="flex items-center gap-4 p-4 w-full bg-white rounded-xl border border-primary-100 shadow-2xs transition-shadow hover:shadow-md lg:max-w-sm"
          >
            <DateTile
              date={toWitaDate(nearest.startAt)}
              label="Tanggal event"
              className="w-14 h-14 bg-secondary text-gray-900"
            />
            <span className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-700">Event terdekat</span>
              <span className="font-semibold text-gray-900 line-clamp-1">{nearest.title}</span>
              <span className="text-sm text-gray-600 line-clamp-1">
                {[formatTimeRange(nearest.startAt, nearest.endAt), nearest.location].filter(Boolean).join(' · ')}
              </span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
