import React from 'react';
import { SearchX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  /** Ikuti spesifikasi §23, mis. "Belum ada prestasi untuk filter yang dipilih." */
  message: string;
  title?: string;
  /** Ikon lucide; default SearchX. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Tindakan berikutnya, mis. tombol "Reset filter". */
  action?: React.ReactNode;
  className?: string;
}

/** Daftar portfolio kosong atau filter tanpa hasil. */
export function EmptyState({ message, title, icon: Icon = SearchX, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-4 py-16 text-center bg-card rounded-2xl border border-dashed border-gray-200',
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 mb-1 rounded-full bg-primary-50 text-primary">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      {title ? <h3 className="font-heading text-lg font-bold text-gray-900">{title}</h3> : null}
      <p className="max-w-md text-sm leading-relaxed text-gray-500">{message}</p>
      {action}
    </div>
  );
}
