import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import { formatDate } from '@/lib/format/date';
import { CONTENT_LEVEL_LABELS } from '@/lib/format/labels';
import type { Competition } from '@/types/competition';

interface FeaturedCompetitionProps {
  competition: Competition;
}

/**
 * Banner kompetisi unggulan di atas linimasa; seluruh kartu menuju halaman detail.
 * @param competition - Kompetisi bertanda `featured`
 */
export function FeaturedCompetition({ competition }: FeaturedCompetitionProps) {
  const { slug, title, organizer, level, registrationDeadline, poster } = competition;
  const meta = [
    organizer,
    level ? CONTENT_LEVEL_LABELS[level] : null,
    registrationDeadline ? `Daftar sampai ${formatDate(registrationDeadline)}` : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/competitions/${slug}`}
      className="group flex flex-col overflow-hidden bg-card rounded-xl border border-gray-200/90 shadow-2xs transition-shadow hover:shadow-md sm:flex-row"
    >
      <div className="relative w-full h-48 shrink-0 bg-primary-50 sm:w-2/5 sm:h-auto sm:min-h-52">
        {poster ? (
          <Image
            src={poster}
            alt={`Poster ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover object-center"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full">
            <Trophy className="w-12 h-12 text-primary-200" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2.5 p-6 sm:p-7">
        <span className="self-start px-2.5 py-0.5 rounded-sm border border-secondary bg-secondary/15 text-xs font-bold text-gray-900">
          Unggulan
        </span>
        <h2 className="font-heading text-2xl font-bold leading-snug text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{meta.join(' · ')}</p>
        <span className="inline-flex items-center gap-1.5 mt-1 text-sm font-semibold text-primary">
          Lihat detail
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
