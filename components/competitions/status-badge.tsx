import React from 'react';
import { CheckCircle2, Clock, Flag, Lock, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompetitionStatus } from '@/types/competition';

interface StatusBadgeProps {
  status: CompetitionStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  CompetitionStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  UPCOMING: { label: 'Segera Dibuka', icon: Clock, classes: 'bg-accent/10 text-accent' },
  OPEN: { label: 'Pendaftaran Dibuka', icon: CheckCircle2, classes: 'bg-success/10 text-success' },
  ONGOING: { label: 'Sedang Berlangsung', icon: Radio, classes: 'bg-warning/10 text-warning' },
  CLOSED: { label: 'Pendaftaran Ditutup', icon: Lock, classes: 'bg-muted text-gray-600' },
  FINISHED: { label: 'Selesai', icon: Flag, classes: 'bg-muted text-gray-500' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, icon: Icon, classes } = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-semibold',
        classes,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
