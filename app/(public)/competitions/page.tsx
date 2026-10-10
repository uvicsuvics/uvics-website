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

  function handleResetFilters() {
    setSearch('');
    setStatus('ALL');
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 1. Hero Section */}
      <CompetitionHero />

      {/* 2. Featured Competition Section */}
      {featured && <FeaturedCompetition competition={featured} />}

      {/* 3. Main Listing Section with Integrated Controls */}
      <section
        className="max-w-7xl mx-auto w-full px-6 md:px-8 py-10 md:py-14 flex flex-col gap-6"
        aria-labelledby="all-competitions-heading"
      >
        {/* Listing Header */}
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

        {/* Search & Filter Toolbar with Result Summary */}
        <CompetitionFilter
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
          totalResults={filtered.length}
        />

        {/* Grid or Empty State */}
        {paginated.length > 0 ? (
          <CompetitionGrid competitions={paginated} />
        ) : (
          <CompetitionEmptyState
            hasFilter={Boolean(search.trim() || status !== 'ALL')}
            onReset={handleResetFilters}
          />
        )}

        {/* Pagination Controls */}
        <CompetitionPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
