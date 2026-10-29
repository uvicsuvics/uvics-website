import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, FolderGit2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { PROJECT_STATUS_CONFIG, getYear } from '@/components/portfolio/portfolioLabels';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/portfolio';

interface ProjectCardProps {
  project: Project;
  className?: string;
}

/**
 * Kartu project: cover, status, judul, ringkasan, dan tahun.
 * Seluruh kartu dapat diklik lewat tautan pada judul menuju /projects/{slug}.
 * @param project - Data project
 * @param className - CSS class tambahan (opsional)
 */
export function ProjectCard({ project, className }: ProjectCardProps) {
  const { slug, title, summary, coverImage, status, startDate, endDate } = project;
  const { label: statusLabel, badgeClassName } = PROJECT_STATUS_CONFIG[status];
  const referenceDate = startDate ?? endDate;

  return (
    <article
      className={cn(
        'group relative flex flex-col w-full h-full overflow-hidden bg-card rounded-xl border border-gray-200/90 shadow-2xs transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
    >
      <div className="relative w-full aspect-16/10 overflow-hidden bg-primary-50/60">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`Cover project ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-primary-50">
            <FolderGit2 className="w-12 h-12 text-primary-200" aria-hidden="true" />
          </div>
        )}
        {/* bg-white terakhir agar badge tetap terbaca di atas foto (menimpa latar translusen dari config). */}
        <Badge className={cn('absolute top-3 right-3 px-2.5 py-1 font-semibold shadow-xs', badgeClassName, 'bg-white')}>
          {statusLabel}
        </Badge>
      </div>

      <div className="flex flex-col flex-1 gap-3 p-5">
        <h3 className="font-heading sm:text-lg font-bold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-primary">
          <Link
            href={`/projects/${slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3">{summary}</p>

        {referenceDate ? (
          <div className="flex items-center gap-2 pt-3 mt-auto text-xs sm:text-sm text-gray-600 border-t border-gray-100">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <time dateTime={referenceDate}>{getYear(referenceDate)}</time>
          </div>
        ) : null}
      </div>
    </article>
  );
}
