import { type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type Variant = 'success' | 'warning' | 'danger' | 'info';

interface AlertProps {
  variant?: Variant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantMap: Record<Variant, { bg: string; border: string; text: string; icon: ReactNode }> = {
  success: {
    bg: 'bg-status-success/10',
    border: 'border-status-success/30',
    text: 'text-status-success',
    icon: <CheckCircle2 size={18} />,
  },
  warning: {
    bg: 'bg-status-warning/10',
    border: 'border-status-warning/30',
    text: 'text-status-warning',
    icon: <AlertTriangle size={18} />,
  },
  danger: {
    bg: 'bg-status-danger/10',
    border: 'border-status-danger/30',
    text: 'text-status-danger',
    icon: <AlertCircle size={18} />,
  },
  info: {
    bg: 'bg-status-info/10',
    border: 'border-status-info/30',
    text: 'text-status-info',
    icon: <Info size={18} />,
  },
};

export default function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const v = variantMap[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-btn border',
        v.bg,
        v.border,
        className
      )}
    >
      <div className={cn('shrink-0 mt-0.5', v.text)}>{v.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-medium text-sm mb-0.5', v.text)}>{title}</p>}
        <div className="text-text-secondary text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'shrink-0 w-6 h-6 rounded flex items-center justify-center',
            'text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors'
          )}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}