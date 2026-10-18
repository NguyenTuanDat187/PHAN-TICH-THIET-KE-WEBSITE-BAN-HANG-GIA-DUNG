/**
 * Badge
 * -----
 * Nhãn trạng thái nhỏ (Paid, Pending...). 6 variant màu.
 *
 * @example
 * <Badge variant="success" dot>Paid</Badge>
 * <Badge variant="warning">Pending</Badge>
 */
import { type ReactNode } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantMap: Record<Variant, string> = {
  success: 'bg-status-success/15 text-status-success',
  warning: 'bg-status-warning/15 text-status-warning',
  danger: 'bg-status-danger/15 text-status-danger',
  info: 'bg-status-info/15 text-status-info',
  purple: 'bg-status-purple/15 text-status-purple',
  neutral: 'bg-bg-elevated text-text-secondary border border-border-default',
};

export default function Badge({ variant = 'neutral', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 h-6 px-2.5 rounded-badge text-xs font-medium',
        variantMap[variant],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}