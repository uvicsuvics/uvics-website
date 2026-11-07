'use client';

import React, { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { COMPETITION_STATUS_LABELS, toOptions } from '@/lib/format/labels';
import { listHref } from '@/lib/services/query';
import { cn } from '@/lib/utils';
import type { CompetitionStatus } from '@/types/competition';

interface CompetitionFilterProps {
  search?: string;
  status?: CompetitionStatus;
  totalResults: number;
}

const SEARCH_DEBOUNCE_MS = 300;
const STATUS_OPTIONS: { value: CompetitionStatus | undefined; label: string }[] = [
  { value: undefined, label: 'Semua' },
  ...toOptions(COMPETITION_STATUS_LABELS),
];

const clean = (value: string) => value.trim().replace(/\s+/g, ' ');

/**
 * Pencarian dan filter status yang disimpan di URL. Perubahan filter selalu kembali ke halaman 1.
 * @param search - Kata kunci aktif dari URL
 * @param status - Status aktif dari URL
 * @param totalResults - Jumlah hasil untuk ringkasan
 */
export function CompetitionFilter({ search, status, totalResults }: CompetitionFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(search ?? '');
  // Nilai terakhir yang dikirim ke URL; mencegah ketikan tertimpa balikan dari server.
  const lastSent = useRef(search ?? '');

  useEffect(() => {
    if ((search ?? '') !== lastSent.current) {
      // Reset atau back/forward mengubah URL dari luar komponen ini.
      lastSent.current = search ?? '';
      setValue(search ?? '');
    }
  }, [search]);

  function navigate(nextSearch: string, nextStatus: CompetitionStatus | undefined) {
    lastSent.current = nextSearch;
    startTransition(() => {
      router.replace(listHref(pathname, { search: nextSearch || undefined, status: nextStatus }), {
        scroll: false,
      });
    });
  }

  useEffect(() => {
    const next = clean(value);
    if (next === lastSent.current) return;
    const timer = setTimeout(() => navigate(next, status), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // navigate hanya memakai ref dan setter yang stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, status]);

  return (
    <div
      aria-busy={isPending}
      className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-xl border border-gray-200/90 shadow-2xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Cari kompetisi atau penyelenggara..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 pl-9 pr-9 text-sm rounded-lg border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
            aria-label="Cari kompetisi atau penyelenggara"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter status kompetisi"
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {STATUS_OPTIONS.map((option) => {
            const isSelected = status === option.value;
            return (
              <button
                key={option.label}
                type="button"
                onClick={() => navigate(clean(value), option.value)}
                aria-pressed={isSelected}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 ease-standard cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-primary-50 hover:text-primary hover:border-primary-100',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
        <div>
          <span>
            Menampilkan <strong className="font-semibold text-gray-900">{totalResults}</strong> kompetisi
          </span>
          {status && (
            <span className="ml-1 text-gray-500">
              &bull; Status: <strong className="font-semibold text-primary">{COMPETITION_STATUS_LABELS[status]}</strong>
            </span>
          )}
          {search && (
            <span className="ml-1 text-gray-500">
              &bull; Kata kunci: &quot;<strong className="font-semibold text-gray-900">{search}</strong>&quot;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
