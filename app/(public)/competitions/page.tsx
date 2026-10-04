'use client';

import { useMemo, useState } from 'react';
import { CompetitionHero } from '@/components/competitions/CompetitionHero';
import { FeaturedCompetition } from '@/components/competitions/FeaturedCompetition';
import { CompetitionFilter } from '@/components/competitions/CompetitionFilter';
import { CompetitionGrid } from '@/components/competitions/CompetitionGrid';
import { CompetitionEmptyState } from '@/components/competitions/CompetitionEmptyState';
import { CompetitionPagination } from '@/components/competitions/CompetitionPagination';
import { MOCK_COMPETITIONS } from '@/lib/mock-data/competitions';
import type { CompetitionStatus } from '@/types/competition';

const ITEMS_PER_PAGE = 6;

export default function CompetitionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CompetitionStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const featured = useMemo(
    () => MOCK_COMPETITIONS.find((competition) => competition.featured),
    []
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_COMPETITIONS.filter((competition) => {
      const matchesSearch =
        !query ||
        competition.title.toLowerCase().includes(query) ||
        competition.organizer.toLowerCase().includes(query);
      const matchesStatus = status === 'ALL' || competition.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: CompetitionStatus | 'ALL') {
    setStatus(value);
    setPage(1);
  }

  return (
    <div>
      <CompetitionHero />

      {featured && <FeaturedCompetition competition={featured} />}

      <section className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 md:py-16 flex flex-col gap-8">
        <CompetitionFilter
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
        />

        {paginated.length > 0 ? (
          <CompetitionGrid competitions={paginated} />
        ) : (
          <CompetitionEmptyState />
        )}

        <CompetitionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
