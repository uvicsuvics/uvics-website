import Image from 'next/image';
import { Building2, Calendar, Sparkles, Trophy } from 'lucide-react';
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
  const { title, organizer, category, level, registrationDeadline, poster, slug, status } =
    competition;

  return (
    <section className="bg-muted">
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 md:py-16">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Kompetisi Unggulan
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          <div className="relative w-full h-64 lg:h-full min-h-64 bg-primary-50">
            {poster ? (
              <Image
                src={poster}
                alt={`Poster ${title}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Trophy className="w-16 h-16 text-primary-200" />
              </div>
            )}
            <StatusBadge status={status} className="absolute top-4 right-4 shadow-sm" />
          </div>

          <div className="flex flex-col gap-4 p-6 md:p-8 justify-center">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{category}</Badge>
              <Badge variant="secondary">{level}</Badge>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h3>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{organizer}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Deadline pendaftaran: {formatDate(registrationDeadline)}</span>
            </div>

            <Button href={`/competitions/${slug}`} variant="primary" size="lg" className="mt-2 w-fit">
              Lihat Detail
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
