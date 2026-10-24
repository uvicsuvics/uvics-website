'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { CompetitionStatus } from '@/types/competition';

interface CompetitionFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CompetitionStatus | 'ALL';
  onStatusChange: (value: CompetitionStatus | 'ALL') => void;
  totalResults?: number;
}

const STATUS_OPTIONS: Array<{ value: CompetitionStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Semua' },
  { value: 'UPCOMING', label: 'Segera' },
  { value: 'OPEN', label: 'Dibuka' },
  { value: 'ONGOING', label: 'Berlangsung' },
  { value: 'CLOSED', label: 'Ditutup' },
  { value: 'FINISHED', label: 'Selesai' },
];

export function CompetitionFilter({
  search,
  onSearchChange,
  status,
  onStatusChange,
  totalResults,
}: CompetitionFilterProps) {
  const activeOption = STATUS_OPTIONS.find((opt) => opt.value === status);

  return (
    <div className="flex flex-col gap-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
      {/* Controls Container: Search on left, Status Pills on right */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search Input Box */}
        <div className="relative w-full lg:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Cari kompetisi atau penyelenggara..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 pl-9 pr-9 text-sm rounded-lg border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
            aria-label="Cari kompetisi atau penyelenggara"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Status Filter Chips / Horizontal Scroll on Mobile */}
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
                key={option.value}
                type="button"
                onClick={() => onStatusChange(option.value)}
                aria-pressed={isSelected}
                className={cn(
                  'shrink-0 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 ease-standard cursor-pointer select-none',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-primary-50 hover:text-primary hover:border-primary-100'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Summary Bar */}
      {typeof totalResults === 'number' && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
          <div>
            <span>
              Menampilkan <strong className="font-semibold text-gray-900">{totalResults}</strong> kompetisi
            </span>
            {status !== 'ALL' && activeOption && (
              <span className="ml-1 text-gray-500">
                • Status: <strong className="font-semibold text-primary">{activeOption.label}</strong>
              </span>
            )}
            {search.trim() && (
              <span className="ml-1 text-gray-500">
                • Kata kunci: &quot;<strong className="font-semibold text-gray-900">{search.trim()}</strong>&quot;
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
