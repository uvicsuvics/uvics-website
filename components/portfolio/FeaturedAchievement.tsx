import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LEVEL_LABELS, formatPortfolioDate } from '@/components/portfolio/portfolioLabels';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types/portfolio';

interface FeaturedAchievementProps {
  achievement: Achievement;
  className?: string;
}

/** Sorotan satu prestasi: gambar besar di kiri, ringkasan di kanan (bertumpuk di mobile). */
export function FeaturedAchievement({ achievement, className }: FeaturedAchievementProps) {
  const { slug, title, competitionName, level, ranking, achievementDate, description, coverImage } = achievement;

  return (
    <article
      className={cn(
        'group relative grid overflow-hidden bg-card rounded-2xl border border-gray-200/90 shadow-sm transition-shadow duration-200 ease-standard hover:shadow-md focus-within:ring-2 focus-within:ring-primary/40 lg:grid-cols-2',
        className
      )}
    >
      <div className="relative w-full aspect-16/10 overflow-hidden bg-primary-50 lg:aspect-auto lg:min-h-80">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`Dokumentasi prestasi ${title}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Trophy className="w-16 h-16 text-primary-200" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="px-2.5 py-1 font-semibold bg-secondary text-gray-900">
            <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
            {ranking}
          </Badge>
          {level ? <Badge variant="accent">{LEVEL_LABELS[level]}</Badge> : null}
        </div>

        <h3 className="font-heading text-2xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary sm:text-3xl">
          <Link
            href={`/achievements/${slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>

        <p className="text-sm font-medium text-gray-500">{competitionName}</p>
        <p className="text-sm leading-relaxed text-gray-600 line-clamp-3 sm:text-base">{description}</p>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100">
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarDays className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <time dateTime={achievementDate}>{formatPortfolioDate(achievementDate)}</time>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary" aria-hidden="true">
            Lihat detail
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </article>
  );
}
