import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface CompetitionEmptyStateProps {
  hasFilter?: boolean;
  onReset?: () => void;
}

export function CompetitionEmptyState({
  hasFilter = true,
  onReset,
}: CompetitionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center bg-card border border-dashed border-gray-200 rounded-2xl my-2">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary mb-1">
        <SearchX className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 font-heading">
        {hasFilter ? 'Kompetisi tidak ditemukan' : 'Belum ada kompetisi tersedia'}
      </h3>

      <p className="max-w-md text-sm text-gray-500 leading-relaxed">
        {hasFilter
          ? 'Coba ubah kata kunci pencarian atau sesuaikan pilihan filter status untuk melihat kompetisi lainnya.'
          : 'Saat ini belum ada daftar kompetisi yang dipublikasikan. Silakan cek kembali dalam waktu dekat.'}
      </p>

      {hasFilter && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg text-xs font-semibold text-primary bg-primary-50 hover:bg-primary-100/80 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Filter & Pencarian</span>
        </button>
      )}
    </div>
  );
}
