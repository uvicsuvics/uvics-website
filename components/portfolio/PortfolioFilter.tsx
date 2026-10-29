'use client';

import React, { useId } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PortfolioOption } from '@/components/portfolio/portfolioLabels';

export interface PortfolioFilterField {
  /** Kunci unik, mis. "year", "level", "category", "ranking", "status". */
  id: string;
  label: string;
  options: PortfolioOption[];
}

interface PortfolioFilterProps {
  fields: PortfolioFilterField[];
  /** Nilai terpilih per `field.id`; string kosong atau kunci tidak ada berarti "Semua". */
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onReset: () => void;
  totalResults?: number;
  /** Satuan pada ringkasan hasil, mis. "prestasi" atau "project". */
  resultLabel?: string;
  className?: string;
}

/**
 * Kontrol filter terkontrol berbasis select native (nyaman di mobile dan aksesibel).
 * Field ditentukan pemanggil: Year, Level, Category, Ranking untuk prestasi; Status untuk project.
 */
export function PortfolioFilter({
  fields,
  values,
  onChange,
  onReset,
  totalResults,
  resultLabel = 'hasil',
  className,
}: PortfolioFilterProps) {
  const baseId = useId();
  const hasActiveFilter = fields.some((field) => Boolean(values[field.id]));

  return (
    <div
      className={cn(
        'flex flex-col gap-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-200/90 shadow-2xs',
        className
      )}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        {fields.map((field) => {
          const selectId = `${baseId}-${field.id}`;
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={selectId} className="text-xs font-semibold text-gray-600">
                {field.label}
              </label>
              <div className="relative">
                <select
                  id={selectId}
                  value={values[field.id] ?? ''}
                  onChange={(event) => onChange(field.id, event.target.value)}
                  className="w-full h-10 pl-3 pr-9 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 outline-none appearance-none cursor-pointer transition-colors hover:border-primary-200 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <option value="">Semua</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>
          );
        })}
      </div>

      {typeof totalResults === 'number' || hasActiveFilter ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500" aria-live="polite">
            {typeof totalResults === 'number' ? (
              <>
                Menampilkan <strong className="font-semibold text-gray-900">{totalResults}</strong>{' '}
                {resultLabel}
              </>
            ) : null}
          </p>
          {hasActiveFilter ? (
            <Button type="button" variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-primary">
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset filter
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
