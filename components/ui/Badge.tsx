import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'primary', className, children }: BadgeProps) {
  const variants = {
    primary: 'bg-primary-50 text-primary-900',
    secondary: 'bg-secondary/15 text-gray-800',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
