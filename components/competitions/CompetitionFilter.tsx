'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { CompetitionStatus } from '@/types/competition';

interface CompetitionFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: CompetitionStatus | 'ALL';
  onStatusChange: (value: CompetitionStatus | 'ALL') => void;
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
}: CompetitionFilterProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari nama kompetisi..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Cari kompetisi"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-250 ease-standard',
              status === option.value
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-primary-50 hover:text-primary'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
