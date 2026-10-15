import { CompetitionCard } from '@/components/competitions/competition-card';
import type { Competition } from '@/types/competition';

interface RelatedCompetitionsProps {
  competitions: Competition[];
}

export function RelatedCompetitions({ competitions }: RelatedCompetitionsProps) {
  if (competitions.length === 0) return null;

  return (
    <section className="bg-muted">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 md:py-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Kompetisi Terkait
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      </div>
    </section>
  );
}
