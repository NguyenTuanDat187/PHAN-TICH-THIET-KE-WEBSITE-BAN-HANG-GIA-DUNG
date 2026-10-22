import { cn } from '../../utils/cn';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral';

const statusMap: Record<string, StatusVariant> = {
  Paid: 'success', Delivered: 'success', Active: 'success', Completed: 'success',
  Pending: 'warning', Processing: 'warning', 'On hold': 'warning',
  Cancelled: 'danger', Refunded: 'danger', Failed: 'danger', Inactive: 'danger',
  Shipping: 'info', Shipped: 'info', 'In transit': 'info',
  Draft: 'purple', New: 'purple',
};

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-status-success/15 text-status-success',
  warning: 'bg-status-warning/15 text-status-warning',
  danger:  'bg-status-danger/15 text-status-danger',
  info:    'bg-status-info/15 text-status-info',
  purple:  'bg-status-purple/15 text-status-purple',
  neutral: 'bg-bg-elevated text-text-secondary',
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

export default function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const v = variant ?? statusMap[status] ?? 'neutral';
  return (
    <span className={cn(
      'inline-flex items-center h-6 px-2.5 rounded-badge text-xs font-medium',
      variantStyles[v],
      className
    )}>
      {status}
    </span>
  );
}