import { SearchX } from 'lucide-react';
import { CompetitionFilter } from '@/components/competitions/CompetitionFilter';
import { CompetitionGrid } from '@/components/competitions/CompetitionGrid';
import { CompetitionHero } from '@/components/competitions/CompetitionHero';
import { FeaturedCompetition } from '@/components/competitions/FeaturedCompetition';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { getCompetitions } from '@/lib/services/competitionService';
import { listHref, orNotFound, readEnum, readPage, readSearch, type SearchParams } from '@/lib/services/query';
import { COMPETITION_STATUSES } from '@/types/competition';

// Sama dengan ITEMS_PER_PAGE sebelumnya; tidak muncul di URL.
const COMPETITIONS_PAGE_SIZE = 6;
const LISTING_ID = 'semua-kompetisi';

interface CompetitionsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CompetitionsPage({ searchParams }: CompetitionsPageProps) {
  const params = await searchParams;
  const search = readSearch(params);
  const status = readEnum(params, 'status', COMPETITION_STATUSES);

  const [{ items, pagination }, { items: featuredItems }] = await Promise.all([
    orNotFound(
      getCompetitions({ page: readPage(params), search, status, page_size: COMPETITIONS_PAGE_SIZE }),
    ),
    getCompetitions({ featured: true, page_size: 1 }),
  ]);
  const featured = featuredItems[0];
  const hasFilter = Boolean(search || status);

  return (
    <div className="min-h-screen bg-background">
      <CompetitionHero />

      {featured && <FeaturedCompetition competition={featured} />}

      <section
        id={LISTING_ID}
        className="max-w-7xl mx-auto w-full px-6 md:px-8 py-10 md:py-14 flex flex-col gap-6 scroll-mt-24"
        aria-labelledby="all-competitions-heading"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="all-competitions-heading"
            className="text-xl sm:text-2xl font-bold text-gray-900 font-heading"
          >
            Semua Kompetisi
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Temukan peluang prestasi yang sesuai berdasarkan nama kompetisi, penyelenggara, atau status pendaftaran.
          </p>
        </div>

        <CompetitionFilter search={search} status={status} totalResults={pagination.total_items} />

        {items.length > 0 ? (
          <CompetitionGrid competitions={items} />
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
                <Button variant="outline" size="md" href={`/competitions#${LISTING_ID}`}>
                  Reset filter
                </Button>
              ) : undefined
            }
          />
        )}

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          label="Navigasi halaman kompetisi"
          getHref={(page) => `${listHref('/competitions', { search, status, page })}#${LISTING_ID}`}
        />
      </section>
    </div>
  );
}
