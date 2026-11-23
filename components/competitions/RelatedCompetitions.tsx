import Link from 'next/link';
import { CompetitionTimelineRow } from '@/components/competitions/CompetitionTimeline';
import type { Competition } from '@/types/competition';

interface RelatedCompetitionsProps {
  competitions: Competition[];
}

/**
 * Kompetisi terkait di halaman detail, memakai baris linimasa yang sama dengan halaman daftar.
 * @param competitions - Hasil `getRelatedCompetitions`
 */
export function RelatedCompetitions({ competitions }: RelatedCompetitionsProps) {
  if (competitions.length === 0) return null;

  return (
    <section aria-labelledby="kompetisi-terkait" className="bg-gray-50 border-t border-gray-200/90">
      <div className="flex flex-col mx-auto px-6 py-12 w-full max-w-7xl md:px-8 md:py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-2.5 border-b-2 border-gray-900">
          <h2 id="kompetisi-terkait" className="font-heading text-2xl font-bold text-gray-900">
            Kompetisi terkait
          </h2>
          <Link href="/competitions" className="text-sm font-semibold text-primary hover:text-primary-600">
            Lihat semua kompetisi
          </Link>
        </div>
        <ul>
          {competitions.map((competition) => (
            <CompetitionTimelineRow key={competition.id} competition={competition} />
          ))}
        </ul>
      </div>
    </section>
  );
}
