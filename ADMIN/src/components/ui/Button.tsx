/**
 * Button
 * ------
 * Nút chuẩn với 4 variant: primary (xanh), secondary (viền),
 * ghost (nền trong suốt), icon (vuông icon).
 *
 * @example
 * <Button variant="primary" loading={saving}>Lưu</Button>
 * <Button variant="icon"><Trash size={16} /></Button>
 */
import { Loader2 } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: cn(
    'inline-flex items-center justify-center gap-2 h-btn px-5 rounded-btn',
    'bg-accent-primary text-black font-semibold text-sm',
    'transition-all duration-app ease-app',
    'hover:bg-accent-hover active:bg-accent-pressed active:translate-y-px',
    'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-app',
    'disabled:opacity-50 disabled:pointer-events-none'
  ),
  secondary: cn(
    'inline-flex items-center justify-center gap-2 h-btn-sm px-4 rounded-btn',
    'bg-bg-elevated text-text-primary font-medium text-sm',
    'border border-border-strong',
    'transition-all duration-app ease-app',
    'hover:bg-bg-hover hover:border-text-muted active:translate-y-px',
    'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-app',
    'disabled:opacity-50 disabled:pointer-events-none'
  ),
  ghost: cn(
    'inline-flex items-center justify-center gap-2 h-btn-sm px-3 rounded-btn',
    'bg-transparent text-text-secondary font-medium text-sm',
    'transition-all duration-app ease-app',
    'hover:bg-bg-hover hover:text-text-primary active:translate-y-px',
    'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-app'
  ),
  icon: cn(
    'inline-flex items-center justify-center w-10 h-10 rounded-btn',
    'bg-transparent text-text-secondary',
    'transition-all duration-app ease-app',
    'hover:bg-bg-hover hover:text-text-primary active:translate-y-px',
    'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-app'
  ),
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';