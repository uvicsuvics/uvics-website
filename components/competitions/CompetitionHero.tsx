import Link from 'next/link';
import { formatDayMonth } from '@/lib/format/date';
import type { Competition } from '@/types/competition';

interface CompetitionHeroProps {
  /** Kompetisi dibuka dengan batas pendaftaran terdekat; null bila tidak ada. */
  nearest: Competition | null;
}

/**
 * Header halaman kompetisi: breadcrumb, judul, dan pintasan ke deadline terdekat.
 * @param nearest - Kompetisi dengan batas pendaftaran terdekat
 */
export function CompetitionHero({ nearest }: CompetitionHeroProps) {
  const deadline = nearest?.registrationDeadline ? formatDayMonth(nearest.registrationDeadline) : null;

  return (
    <section className="bg-primary-50 border-b border-primary-100">
      <div className="flex flex-col gap-8 mx-auto px-6 pt-28 pb-10 w-full max-w-7xl md:px-8 md:pt-32 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 min-w-0 max-w-2xl">
          <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
            <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
              Beranda
            </Link>
            <span aria-hidden="true" className="mx-2 text-gray-400">/</span>
            <span aria-current="page" className="font-semibold text-primary">Kompetisi</span>
          </nav>
          <h1 className="font-heading text-4xl font-bold leading-tight text-primary-900 md:text-5xl">
            Kompetisi &amp; Kejuaraan
          </h1>
          <p className="text-base leading-relaxed text-gray-700">
            Semua lomba yang diikuti UVICS, dikelompokkan menurut status. Yang masih dibuka diurutkan dari batas pendaftaran terdekat supaya timmu tidak ketinggalan.
          </p>
        </div>

        {nearest && deadline && (
          <Link
            href={`/competitions/${nearest.slug}`}
            className="flex items-center gap-4 p-4 w-full bg-white rounded-xl border border-primary-100 shadow-2xs transition-shadow hover:shadow-md lg:max-w-sm"
          >
            <span className="flex flex-col items-center justify-center shrink-0 w-14 h-14 rounded-lg bg-secondary text-gray-900 leading-none">
              <span className="text-[11px] font-bold uppercase">{deadline.month}</span>
              <span className="font-heading text-2xl font-bold">{deadline.day}</span>
            </span>
            <span className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-700">Deadline terdekat</span>
              <span className="font-semibold text-gray-900 line-clamp-1">{nearest.title}</span>
              <span className="text-sm text-gray-600 line-clamp-1">{nearest.organizer}</span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
