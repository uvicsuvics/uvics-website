'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompetitionPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const showLeftEllipsis = currentPage > 3;
  const showRightEllipsis = currentPage < totalPages - 2;

  pages.push(1);

  if (showLeftEllipsis) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push('ellipsis');
  }

  pages.push(totalPages);

  return pages;
}

export function CompetitionPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CompetitionPaginationProps) {
  if (totalPages <= 1) return null;

  const pageItems = getPageNumbers(currentPage, totalPages);

  return (
    <nav
      aria-label="Navigasi halaman kompetisi"
      className="flex items-center justify-center gap-1.5 sm:gap-2 pt-4"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-200 text-gray-700 bg-white transition-colors duration-200 ease-standard hover:bg-primary-50 hover:text-primary hover:border-primary-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 cursor-pointer shadow-2xs"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {/* Page Numbers & Ellipsis */}
      {pageItems.map((item, idx) => {
        if (item === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="flex items-center justify-center w-8 h-9 sm:w-9 sm:h-10 text-gray-400 select-none text-xs sm:text-sm"
              aria-hidden="true"
            >
              …
            </span>
          );
        }

        const isCurrent = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Halaman ${item}`}
            className={cn(
              'flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ease-standard cursor-pointer shadow-2xs',
              isCurrent
                ? 'bg-primary text-white border border-primary font-semibold shadow-xs'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-primary-50 hover:text-primary hover:border-primary-100'
            )}
          >
            {item}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Halaman berikutnya"
        className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-200 text-gray-700 bg-white transition-colors duration-200 ease-standard hover:bg-primary-50 hover:text-primary hover:border-primary-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 cursor-pointer shadow-2xs"
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
