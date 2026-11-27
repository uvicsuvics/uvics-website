import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { StatusBadge } from '@/components/competitions/status-badge';
import { Badge } from '@/components/ui/Badge';
import { CONTENT_LEVEL_LABELS } from '@/lib/format/labels';
import type { Competition } from '@/types/competition';

interface CompetitionDetailHeaderProps {
  competition: Competition;
}

/**
 * Header detail kompetisi: breadcrumb, status, tingkat, kategori, judul, dan penyelenggara.
 * @param competition - Kompetisi yang ditampilkan
 */
export function CompetitionDetailHeader({ competition }: CompetitionDetailHeaderProps) {
  const { title, organizer, category, level, status } = competition;

  return (
    <section className="bg-primary-50 border-b border-primary-100">
      <div className="flex flex-col gap-4 mx-auto px-6 pt-28 pb-10 w-full max-w-7xl md:px-8 md:pt-32 md:pb-12">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
                Beranda
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li>
              <Link href="/competitions" className="text-gray-600 transition-colors hover:text-primary">
                Kompetisi
              </Link>
            </li>
            <li aria-hidden="true" className="text-gray-400">/</li>
            <li aria-current="page" className="font-semibold text-primary line-clamp-1">
              {title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          {level && <Badge variant="secondary">{CONTENT_LEVEL_LABELS[level]}</Badge>}
          {category && <Badge variant="primary" className="bg-white">{category}</Badge>}
        </div>

        <h1 className="max-w-4xl font-heading text-4xl font-bold leading-tight text-primary-900 md:text-5xl">
          {title}
        </h1>

        <p className="flex items-center gap-2 text-base text-gray-700">
          <Building2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          {organizer}
        </p>
      </div>
    </section>
  );
}
