'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Label landmark untuk pembaca layar, mis. "Navigasi halaman prestasi". */
  label?: string;
  className?: string;
}

const NAV_BUTTON_CLASS =
  'flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-sm font-medium bg-white rounded-lg border border-gray-200 shadow-2xs cursor-pointer transition-colors duration-200 ease-standard';

/** Nomor halaman dengan elipsis: 1 … (aktif-1) aktif (aktif+1) … total. */
function getPageItems(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | 'ellipsis')[] = [1];
  if (currentPage > 3) items.push('ellipsis');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let page = start; page <= end; page++) items.push(page);

  if (currentPage < totalPages - 2) items.push('ellipsis');
  items.push(totalPages);

  return items;
}

/**
 * Navigasi halaman terkontrol. Tidak dirender bila hanya ada satu halaman.
 * @param currentPage - Halaman aktif (mulai dari 1)
 * @param totalPages - Jumlah seluruh halaman
 * @param onPageChange - Dipanggil dengan nomor halaman tujuan
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  label = 'Navigasi halaman',
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <nav
      aria-label={label}
      className={cn('flex items-center justify-center gap-1.5 sm:gap-2 pt-4', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Halaman sebelumnya"
        className={cn(
          NAV_BUTTON_CLASS,
          'text-gray-700 hover:bg-primary-50 hover:text-primary hover:border-primary-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200'
        )}
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {getPageItems(currentPage, totalPages).map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-6 sm:w-8 h-9 sm:h-10 text-sm text-gray-400 select-none"
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
              NAV_BUTTON_CLASS,
              isCurrent
                ? 'font-semibold text-white bg-primary border-primary'
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary hover:border-primary-100'
            )}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Halaman berikutnya"
        className={cn(
          NAV_BUTTON_CLASS,
          'text-gray-700 hover:bg-primary-50 hover:text-primary hover:border-primary-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200'
        )}
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
