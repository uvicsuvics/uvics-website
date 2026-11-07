'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationBaseProps {
  currentPage: number;
  totalPages: number;
  /** Label landmark untuk pembaca layar, mis. "Navigasi halaman prestasi". */
  label?: string;
  className?: string;
}

type PaginationProps = PaginationBaseProps &
  (
    | { onPageChange: (page: number) => void; getHref?: never }
    | { getHref: (page: number) => string; onPageChange?: never }
  );

const NAV_BUTTON_CLASS =
  'flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-sm font-medium bg-white rounded-lg border border-gray-200 shadow-2xs cursor-pointer transition-colors duration-200 ease-standard';
const ARROW_CLASS =
  'text-gray-700 hover:bg-primary-50 hover:text-primary hover:border-primary-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200';
const PAGE_CLASS = 'text-gray-700 hover:bg-primary-50 hover:text-primary hover:border-primary-100';
const CURRENT_CLASS = 'font-semibold text-white bg-primary border-primary';

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
 * Navigasi halaman. Tidak dirender bila hanya ada satu halaman.
 * Mode callback memakai `onPageChange`; mode tautan (server-rendered) memakai `getHref`.
 * @param currentPage - Halaman aktif (mulai dari 1)
 * @param totalPages - Jumlah seluruh halaman
 * @param onPageChange - Dipanggil dengan nomor halaman tujuan
 * @param getHref - Menghasilkan href untuk nomor halaman tujuan
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  getHref,
  label = 'Navigasi halaman',
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  /** Satu kontrol halaman: tautan, tombol, atau span nonaktif sesuai mode. */
  const renderControl = (
    page: number,
    ariaLabel: string,
    classes: string,
    content: React.ReactNode,
    disabled: boolean,
    isCurrent = false
  ) => {
    const controlClass = cn(NAV_BUTTON_CLASS, classes);
    const current = isCurrent ? 'page' : undefined;

    if (getHref) {
      return disabled ? (
        <span
          aria-disabled="true"
          aria-label={ariaLabel}
          className={cn(controlClass, 'opacity-40 cursor-not-allowed')}
        >
          {content}
        </span>
      ) : (
        <Link href={getHref(page)} aria-current={current} aria-label={ariaLabel} className={controlClass}>
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onPageChange(page)}
        disabled={disabled}
        aria-current={current}
        aria-label={ariaLabel}
        className={controlClass}
      >
        {content}
      </button>
    );
  };

  return (
    <nav
      aria-label={label}
      className={cn('flex items-center justify-center gap-1.5 sm:gap-2 pt-4', className)}
    >
      {renderControl(
        currentPage - 1,
        'Halaman sebelumnya',
        ARROW_CLASS,
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />,
        isFirst
      )}

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
          <React.Fragment key={item}>
            {renderControl(item, `Halaman ${item}`, isCurrent ? CURRENT_CLASS : PAGE_CLASS, item, false, isCurrent)}
          </React.Fragment>
        );
      })}

      {renderControl(
        currentPage + 1,
        'Halaman berikutnya',
        ARROW_CLASS,
        <ChevronRight className="w-4 h-4" aria-hidden="true" />,
        isLast
      )}
    </nav>
  );
}
