'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompetitionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CompetitionPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CompetitionPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Navigasi halaman kompetisi"
      className="flex items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 transition-colors duration-250 ease-standard hover:bg-primary-50 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-250 ease-standard',
            page === currentPage
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
          )}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 transition-colors duration-250 ease-standard hover:bg-primary-50 hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
