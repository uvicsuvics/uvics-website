'use client';

import React, { useEffect, useOptimistic, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { COMPETITION_STATUS_LABELS, CONTENT_LEVEL_LABELS, toOptions } from '@/lib/format/labels';
import { cn, listHref } from '@/lib/utils';
import { COMPETITION_STATUS_ORDER, type CompetitionStatus } from '@/types/competition';
import type { ContentLevel } from '@/types/portfolio';

interface Filters {
  status?: CompetitionStatus;
  level?: ContentLevel;
  category?: string;
}

interface CompetitionFilterProps extends Filters {
  search?: string;
  /** Jumlah per status setelah filter lain diterapkan. */
  statusCounts: Record<CompetitionStatus, number>;
  total: number;
  categories: string[];
}

const SEARCH_DEBOUNCE_MS = 300;
const LEVEL_OPTIONS = toOptions(CONTENT_LEVEL_LABELS);

const clean = (value: string) => value.trim().replace(/\s+/g, ' ');

function RadioOption({
  name,
  label,
  count,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  count?: number;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        'flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors',
        checked ? 'bg-primary-50 font-semibold text-primary-900' : 'text-gray-700 hover:bg-muted',
      )}
    >
      <span className="flex items-center gap-2.5">
        <input type="radio" name={name} checked={checked} onChange={onSelect} className="accent-primary" />
        {label}
      </span>
      {count !== undefined && (
        <span className={cn('text-xs font-normal', checked ? 'text-primary-900' : 'text-gray-500')}>{count}</span>
      )}
    </label>
  );
}

/**
 * Filter halaman kompetisi yang disimpan di URL: pencarian, status, tingkat, dan kategori.
 * @param search - Kata kunci aktif dari URL
 * @param statusCounts - Jumlah per status untuk label radio
 * @param categories - Pilihan kategori dari service
 */
export function CompetitionFilter({ search, status, level, category, statusCounts, total, categories }: CompetitionFilterProps) {
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

  // Filter terbaru untuk timer debounce; closure lama bisa membatalkan pilihan yang baru dibuat.
  const filtersRef = useRef<Filters>({ status, level, category });
  useEffect(() => {
    filtersRef.current = { status, level, category };
  }, [status, level, category]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Pilihan tampil seketika selama navigasi berjalan; tanpa ini radio kembali ke nilai lama
  // sampai server membalas dengan props baru.
  const [shown, setShown] = useOptimistic<Filters>({ status, level, category });

  function navigate(nextSearch: string, next: Filters) {
    // Navigasi baru membatalkan debounce yang tertunda, dan pilihan baru langsung tercatat
    // supaya ketikan berikutnya tidak memakai filter lama selama server belum membalas.
    clearTimeout(timer.current);
    lastSent.current = nextSearch;
    filtersRef.current = next;
    startTransition(() => {
      setShown(next);
      router.replace(listHref(pathname, { search: nextSearch || undefined, ...next }), { scroll: false });
    });
  }

  const change = (patch: Filters) => navigate(clean(value), { ...filtersRef.current, ...patch });

  useEffect(() => {
    const next = clean(value);
    if (next === lastSent.current) return;
    const id = setTimeout(() => {
      if (next !== lastSent.current) navigate(next, filtersRef.current);
    }, SEARCH_DEBOUNCE_MS);
    timer.current = id;
    return () => clearTimeout(id);
    // navigate hanya memakai ref dan setter yang stabil.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const hasFilter = Boolean(search || status || level || category);
  const activeCount = [shown.status, shown.level, shown.category].filter(Boolean).length;
  // Di layar kecil filter dilipat supaya daftar kompetisi tidak terdorong jauh ke bawah (spesifikasi §26).
  const [showFilters, setShowFilters] = useState(false);

  return (
    <aside aria-label="Filter kompetisi" aria-busy={isPending} className="flex flex-col gap-7 lg:self-start">
      <div className="flex flex-col gap-2">
        <label htmlFor="cari-kompetisi" className="text-sm font-semibold text-gray-800">
          Cari
        </label>
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="cari-kompetisi"
            type="text"
            placeholder="Nama atau penyelenggara"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={100}
            className="h-11 pl-9 pr-9 text-sm rounded-lg border-gray-300 focus-visible:border-primary focus-visible:ring-primary/20"
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
      </div>

      <button
        type="button"
        onClick={() => setShowFilters((open) => !open)}
        aria-expanded={showFilters}
        aria-controls="filter-kompetisi-lanjutan"
        className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-800 lg:hidden"
      >
        <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
        {showFilters ? 'Sembunyikan filter' : activeCount > 0 ? `Filter (${activeCount} aktif)` : 'Filter'}
      </button>

      <div
        id="filter-kompetisi-lanjutan"
        className={cn('flex-col gap-7', showFilters ? 'flex' : 'hidden', 'lg:flex')}
      >
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-2 text-sm font-semibold text-gray-800">Status</legend>
          <RadioOption name="status" label="Semua status" count={total} checked={!shown.status} onSelect={() => change({ status: undefined })} />
          {COMPETITION_STATUS_ORDER.map((code) => (
            <RadioOption
              key={code}
              name="status"
              label={COMPETITION_STATUS_LABELS[code]}
              count={statusCounts[code]}
              checked={shown.status === code}
              onSelect={() => change({ status: code })}
            />
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-1">
          <legend className="mb-2 text-sm font-semibold text-gray-800">Tingkat</legend>
          <RadioOption name="level" label="Semua tingkat" checked={!shown.level} onSelect={() => change({ level: undefined })} />
          {LEVEL_OPTIONS.map((option) => (
            <RadioOption
              key={option.value}
              name="level"
              label={option.label}
              checked={shown.level === option.value}
              onSelect={() => change({ level: option.value })}
            />
          ))}
        </fieldset>

        <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
          Kategori
          <select
            value={shown.category ?? ''}
            onChange={(e) => change({ category: e.target.value || undefined })}
            className="h-11 px-3 rounded-lg border border-gray-300 bg-white text-sm font-normal text-gray-800 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <option value="">Semua kategori</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            navigate('', {});
          }}
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-600"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Reset filter
        </button>
      )}
    </aside>
  );
}
