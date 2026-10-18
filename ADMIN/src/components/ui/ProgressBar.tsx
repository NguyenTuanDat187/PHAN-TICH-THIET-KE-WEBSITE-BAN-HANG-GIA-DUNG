/**
 * ProgressBar
 * -----------
 * Thanh tiến trình 0-100%. Có thể dùng cho upload file, loading,
 * mục tiêu doanh thu...
 *
 * @example
 * <ProgressBar value={65} />
 * <ProgressBar value={30} variant="warning" showLabel />
 * <ProgressBar indeterminate />   // loading vô định
 */
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface ProgressBarProps {
  value?: number;
  variant?: Variant;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  indeterminate?: boolean;
  className?: string;
}

const variantMap: Record<Variant, string> = {
  primary: 'bg-accent-primary',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger:  'bg-status-danger',
  info:    'bg-status-info',
};

export default function ProgressBar({
  value = 0,
  variant = 'primary',
  size = 'md',
  showLabel,
  indeterminate,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-bg-elevated overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2'
        )}
      >
        {indeterminate ? (
          <div className={cn('h-full w-1/3 rounded-full animate-[shimmer_1.5s_infinite]', variantMap[variant])} />
        ) : (
          <div
            className={cn('h-full rounded-full transition-all duration-app ease-app', variantMap[variant])}
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>
      {showLabel && !indeterminate && (
        <p className="text-text-muted text-xs mt-1.5 text-right">{clamped}%</p>
      )}
    </div>
  );
}