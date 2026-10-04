import React from 'react';
import Image from 'next/image';
import { Building2, Calendar, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/competitions/status-badge';
import { cn } from '@/lib/utils';
import type { Competition } from '@/types/competition';

interface CompetitionCardProps {
  competition: Competition;
  className?: string;
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return 'Belum ditentukan';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(deadline));
}

export function CompetitionCard({ competition, className }: CompetitionCardProps) {
  const {
    title,
    slug,
    organizer,
    category,
    level,
    registrationDeadline,
    poster,
    status,
  } = competition;

  return (
    <div
      className={cn(
        'flex flex-col w-full bg-card border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 ease-standard overflow-hidden',
        className
      )}
    >
      <div className="relative w-full h-48 bg-primary-50">
        {poster ? (
          <Image
            src={poster}
            alt={`Poster ${title}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Trophy className="w-12 h-12 text-primary-200" />
          </div>
        )}
        <StatusBadge status={status} className="absolute top-3 right-3 shadow-sm" />
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="primary">{category}</Badge>
          <Badge variant="secondary">{level}</Badge>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{title}</h3>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building2 className="w-4 h-4 shrink-0" />
          <span className="line-clamp-1">{organizer}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Deadline: {formatDeadline(registrationDeadline)}</span>
        </div>

        <Button href={`/competitions/${slug}`} variant="primary" size="md" className="mt-2 w-full">
          Lihat Detail
        </Button>
      </div>
    </div>
  );
}
