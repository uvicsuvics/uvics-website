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
        'group flex flex-col h-full w-full bg-card border border-gray-200/90 rounded-2xl shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300 transition-all duration-200 ease-standard overflow-hidden',
        className
      )}
    >
      {/* Poster Media Box with Stable Aspect Ratio */}
      <div className="relative w-full aspect-16/10 bg-primary-50/60 overflow-hidden">
        {poster ? (
          <Image
            src={poster}
            alt={`Poster ${title}`}
            fill
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-primary-50">
            <Trophy className="w-12 h-12 text-primary-200" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-3 right-3 shadow-xs">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category & Level Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="primary">{category}</Badge>
          <Badge variant="secondary">{level}</Badge>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 font-heading line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Meta Info: Organizer & Deadline */}
        <div className="space-y-1.5 pt-1 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{organizer}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="truncate">Deadline: {formatDeadline(registrationDeadline)}</span>
          </div>
        </div>

        {/* Card CTA: Pushed to bottom for consistent height */}
        <div className="mt-auto pt-3 border-t border-gray-100">
          <Button
            href={`/competitions/${slug}`}
            variant="outline"
            size="sm"
            className="w-full text-xs sm:text-sm font-semibold border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-2xs"
          >
            Lihat Detail
          </Button>
        </div>
      </div>
    </div>
  );
}
