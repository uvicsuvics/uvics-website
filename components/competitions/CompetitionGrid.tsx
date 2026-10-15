import { CompetitionCard } from '@/components/competitions/competition-card';
import type { Competition } from '@/types/competition';

interface CompetitionGridProps {
  competitions: Competition[];
}

export function CompetitionGrid({ competitions }: CompetitionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {competitions.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} />
      ))}
    </div>
  );
}
