'use client';

import { useMemo, useRef, useState } from 'react';
import { SearchX } from 'lucide-react';
import { AchievementCard } from '@/components/portfolio/AchievementCard';
import { PortfolioFilter } from '@/components/portfolio/PortfolioFilter';
import { filterAchievements, getAchievementFilterFields } from '@/components/portfolio/achievementFilters';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import type { AchievementWithRelations } from '@/types/portfolio';

const ITEMS_PER_PAGE = 6;

interface AchievementsExplorerProps {
  items: AchievementWithRelations[];
}

/** Filter, grid, pagination, dan empty state daftar prestasi (state di sisi client). */
export function AchievementsExplorer({ items }: AchievementsExplorerProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const fields = useMemo(() => getAchievementFilterFields(items), [items]);
  const filtered = useMemo(() => filterAchievements(items, values), [items, values]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  function handleChange(fieldId: string, value: string) {
    setValues((previous) => ({ ...previous, [fieldId]: value }));
    setPage(1);
  }

  function handleReset() {
    setValues({});
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="all-achievements-heading"
      className="flex flex-col gap-6 mx-auto px-4 py-12 w-full max-w-7xl scroll-mt-20 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="flex flex-col gap-1">
        <h2 id="all-achievements-heading" className="font-heading text-2xl font-bold text-gray-900">
          Semua Prestasi
        </h2>
        <p className="text-sm text-gray-500">Telusuri berdasarkan tahun, level kompetisi, atau ranking.</p>
      </div>

      <PortfolioFilter
        fields={fields}
        values={values}
        onChange={handleChange}
        onReset={handleReset}
        totalResults={filtered.length}
        resultLabel="prestasi"
      />

      {visible.length > 0 ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ achievement, members }) => (
            <li key={achievement.id}>
              <AchievementCard achievement={achievement} members={members.map((member) => member.name)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={SearchX}
          title="Prestasi tidak ditemukan"
          message={
            items.length === 0
              ? 'Belum ada prestasi yang tersedia saat ini.'
              : 'Belum ada prestasi untuk filter yang dipilih.'
          }
          action={
            items.length > 0 ? (
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Reset filter
              </Button>
            ) : undefined
          }
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        label="Navigasi halaman prestasi"
      />
    </section>
  );
}
