import React from 'react';
import { CheckCircle2, Clock, Flag, Lock, Radio } from 'lucide-react';
import { COMPETITION_STATUS_LABELS } from '@/lib/format/labels';
import { cn } from '@/lib/utils';
import type { CompetitionStatus } from '@/types/competition';

interface StatusBadgeProps {
  status: CompetitionStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  CompetitionStatus,
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  UPCOMING: { icon: Clock, classes: 'bg-accent/10 text-accent' },
  OPEN: { icon: CheckCircle2, classes: 'bg-success/10 text-success' },
  ONGOING: { icon: Radio, classes: 'bg-warning/10 text-warning' },
  CLOSED: { icon: Lock, classes: 'bg-muted text-gray-600' },
  FINISHED: { icon: Flag, classes: 'bg-muted text-gray-500' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { icon: Icon, classes } = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-semibold',
        classes,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {COMPETITION_STATUS_LABELS[status]}
    </span>
  );
}
