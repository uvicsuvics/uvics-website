import { SearchX } from 'lucide-react';
import { CompetitionFilter } from '@/components/competitions/CompetitionFilter';
import { CompetitionHero } from '@/components/competitions/CompetitionHero';
import { CompetitionTimeline } from '@/components/competitions/CompetitionTimeline';
import { FeaturedCompetition } from '@/components/competitions/FeaturedCompetition';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getCompetitionBoard,
  getCompetitionCategories,
  getCompetitions,
} from '@/lib/services/competitionService';
import { readEnum, readSearch, type SearchParams } from '@/lib/services/query';
import { COMPETITION_STATUSES } from '@/types/competition';
import { CONTENT_LEVELS } from '@/types/portfolio';

interface CompetitionsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CompetitionsPage({ searchParams }: CompetitionsPageProps) {
  const params = await searchParams;
  const [categories, { items: featuredItems }] = await Promise.all([
    getCompetitionCategories(),
    getCompetitions({ featured: true, page_size: 1 }),
  ]);
  const filters = {
    search: readSearch(params),
    status: readEnum(params, 'status', COMPETITION_STATUSES),
    level: readEnum(params, 'level', CONTENT_LEVELS),
    category: readEnum(params, 'category', categories),
  };
  const hasFilter = Object.values(filters).some((value) => value !== undefined);

  const board = await getCompetitionBoard(filters);
  const featured = hasFilter ? undefined : featuredItems[0];
  const shown = board.groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <CompetitionHero nearest={board.nearestDeadline} />

      <div className="grid gap-10 mx-auto px-6 py-10 w-full max-w-7xl md:px-8 md:py-14 lg:grid-cols-4">
        <CompetitionFilter
          {...filters}
          statusCounts={board.statusCounts}
          total={board.total}
          categories={categories}
        />

        <div className="flex flex-col gap-8 min-w-0 lg:col-span-3">
          {featured && <FeaturedCompetition competition={featured} />}

          <p className="text-sm text-gray-600" aria-live="polite">
            Menampilkan <strong className="font-semibold text-gray-900">{shown}</strong> kompetisi
          </p>

          {shown > 0 ? (
            <CompetitionTimeline
              groups={board.groups}
              expandArchived={filters.status === 'CLOSED' || filters.status === 'FINISHED'}
            />
          ) : (
            <EmptyState
              icon={SearchX}
              message={
                hasFilter
                  ? 'Belum ada kompetisi untuk filter yang dipilih.'
                  : 'Belum ada kompetisi yang tersedia saat ini.'
              }
              action={
                hasFilter ? (
                  <Button variant="outline" size="md" href="/competitions">
                    Reset filter
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
