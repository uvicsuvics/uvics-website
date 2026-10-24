import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/competitions/status-badge';
import type { Competition } from '@/types/competition';

interface CompetitionDetailHeaderProps {
  competition: Competition;
}

export function CompetitionDetailHeader({ competition }: CompetitionDetailHeaderProps) {
  const { title, organizer, category, level, status } = competition;

  return (
    <section className="bg-primary text-white">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 md:py-16 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{category}</Badge>
          <Badge variant="primary">{level}</Badge>
          <StatusBadge status={status} />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>

        <div className="flex items-center gap-2 text-sm text-primary-100">
          <Building2 className="w-4 h-4 shrink-0" />
          <span>{organizer}</span>
        </div>
      </div>
    </section>
  );
}
