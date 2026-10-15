import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, Trophy, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { LEVEL_LABELS, formatPortfolioDate } from '@/components/portfolio/portfolioLabels';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/types/portfolio';

const MAX_VISIBLE_MEMBERS = 3;
const TOP_RANK_PATTERN = /^juara\s*1\b/i;

interface AchievementCardProps {
  achievement: Achievement;
  /** Nama anggota/tim yang sudah digabung oleh service; `Achievement` hanya menyimpan relasi lewat id. */
  members?: string[];
  className?: string;
}

/**
 * Kartu prestasi: gambar, ranking, judul, nama kompetisi, tim, dan tanggal.
 * Seluruh kartu dapat diklik lewat tautan pada judul menuju /achievements/{slug}.
 * @param achievement - Data prestasi
 * @param members - Nama anggota/tim (opsional)
 * @param className - CSS class tambahan (opsional)
 */
export function AchievementCard({ achievement, members = [], className }: AchievementCardProps) {
  const { slug, title, competitionName, level, ranking, achievementDate, coverImage } = achievement;
  const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);
  const hiddenCount = members.length - visibleMembers.length;
  const isTopRank = TOP_RANK_PATTERN.test(ranking);

  return (
    <article
      className={cn(
        'group relative flex flex-col w-full h-full overflow-hidden bg-card rounded-2xl border border-gray-200/90 shadow-2xs transition-all duration-200 ease-standard hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        className
      )}
    >
      <div className="relative w-full aspect-16/10 overflow-hidden bg-primary-50/60">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={`Dokumentasi prestasi ${title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-103 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-primary-50">
            <Trophy className="w-12 h-12 text-primary-200" aria-hidden="true" />
          </div>
        )}
        <Badge
          variant={isTopRank ? 'secondary' : 'primary'}
          className={cn(
            'absolute top-3 left-3 px-2.5 py-1 font-semibold shadow-xs',
            isTopRank ? 'bg-secondary text-gray-900' : 'bg-white text-primary-900'
          )}
        >
          <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
          {ranking}
        </Badge>
      </div>

      <div className="flex flex-col flex-1 gap-3 p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {level ? <Badge variant="accent">{LEVEL_LABELS[level]}</Badge> : null}
          <span className="line-clamp-1 text-xs font-medium text-gray-500">{competitionName}</span>
        </div>

        <h3 className="font-heading text-base sm:text-lg font-bold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-primary">
          <Link
            href={`/achievements/${slug}`}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </h3>

        <div className="flex flex-col gap-1.5 pt-3 mt-auto text-xs sm:text-sm text-gray-600 border-t border-gray-100">
          {visibleMembers.length > 0 ? (
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" aria-hidden="true" />
              <span className="line-clamp-2">
                {visibleMembers.join(', ')}
                {hiddenCount > 0 ? ` +${hiddenCount} lainnya` : ''}
              </span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <time dateTime={achievementDate}>{formatPortfolioDate(achievementDate)}</time>
          </div>
        </div>
      </div>
    </article>
  );
}
