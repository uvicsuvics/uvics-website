import React from 'react';
import { CheckCircle2, Clock, Flag, Lock, Radio } from 'lucide-react';
import { COMPETITION_STATUS_LABELS } from '@/lib/format/labels';
import { cn } from '@/lib/utils';
import type { CompetitionStatus } from '@/types/competition';

interface StatusBadgeProps {
  status: CompetitionStatus;
  className?: string;
}

// Teks tetap gelap di atas putih supaya kontras cukup di latar mana pun; warna status hanya pada ikon.
const STATUS_CONFIG: Record<
  CompetitionStatus,
  { icon: React.ComponentType<{ className?: string }>; iconClass: string }
> = {
  UPCOMING: { icon: Clock, iconClass: 'text-accent' },
  OPEN: { icon: CheckCircle2, iconClass: 'text-success' },
  ONGOING: { icon: Radio, iconClass: 'text-warning' },
  CLOSED: { icon: Lock, iconClass: 'text-gray-500' },
  FINISHED: { icon: Flag, iconClass: 'text-gray-500' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { icon: Icon, iconClass } = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border border-gray-200/90 bg-white text-xs font-semibold text-gray-900',
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', iconClass)} aria-hidden="true" />
      {COMPETITION_STATUS_LABELS[status]}
    </span>
  );
}
