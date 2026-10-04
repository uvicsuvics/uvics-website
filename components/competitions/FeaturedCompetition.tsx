import React from 'react';
import Image from 'next/image';
import { Building2, Calendar, CalendarDays, Sparkles, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/competitions/status-badge';
import type { Competition } from '@/types/competition';

interface FeaturedCompetitionProps {
  competition: Competition;
}

function formatDate(value: string | null) {
  if (!value) return 'Belum ditentukan';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function FeaturedCompetition({ competition }: FeaturedCompetitionProps) {
  const {
    title,
    organizer,
    category,
    level,
    registrationDeadline,
    competitionDate,
    poster,
    slug,
    status,
    teamSize,
  } = competition;

  return (
    <section className="bg-muted py-8 sm:py-10 md:py-12 border-b border-gray-200/70" aria-labelledby="featured-competition-heading">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <h2
            id="featured-competition-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 font-heading"
          >
            Kompetisi Unggulan
          </h2>
        </div>

        {/* Compact & Refined Featured Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 bg-card border border-gray-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200 hover:border-gray-300">
          {/* Image Column (~42% desktop width) */}
          <div className="md:col-span-5 relative w-full h-56 sm:h-64 md:h-full min-h-[220px] md:min-h-[320px] bg-primary-50 overflow-hidden">
            {poster ? (
              <Image
                src={poster}
                alt={`Poster resmi ${title}`}
                fill
                priority
                className="object-cover object-center transition-transform duration-500 ease-out hover:scale-102"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 40vw"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-primary-50">
                <Trophy className="w-16 h-16 text-primary-200" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Content Column (~58% desktop width) */}
          <div className="md:col-span-7 flex flex-col justify-between p-6 sm:p-7 md:p-8 gap-4">
            <div className="space-y-3">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <Badge variant="primary">{category}</Badge>
                <Badge variant="secondary">{level}</Badge>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-[1.65rem] font-bold text-gray-900 font-heading line-clamp-2 leading-snug">
                {title}
              </h3>
            </div>

            {/* Meta Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-gray-100">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Penyelenggara
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                    {organizer}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Deadline Pendaftaran
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    {formatDate(registrationDeadline)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CalendarDays className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Pelaksanaan
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    {formatDate(competitionDate)}
                  </span>
                </div>
              </div>

              {teamSize && (
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      Format Tim
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                      {teamSize}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <Button
                href={`/competitions/${slug}`}
                variant="primary"
                size="md"
                className="w-full sm:w-fit font-semibold shadow-xs hover:shadow-primary"
              >
                Lihat Detail
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
