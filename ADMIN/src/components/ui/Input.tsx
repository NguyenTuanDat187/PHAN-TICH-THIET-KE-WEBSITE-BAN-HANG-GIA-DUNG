/**
 * Input
 * -----
 * Ô nhập text có label, icon trái, element phải (VD: nút show pass),
 * hint, error.
 *
 * @example
 * <Input label="Email" icon={<Mail size={16} />} placeholder="admin@shop.com" />
 * <Input label="Password" rightElement={<Eye />} type="password" />
 * <Input label="Name" error="Bắt buộc" />
 */
import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightElement?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, hint, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-text-secondary text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-input rounded-btn text-sm',
              'bg-bg-elevated border text-text-primary placeholder:text-text-muted',
              'transition-all duration-app ease-app',
              'focus:outline-none focus:ring-1',
              icon ? 'pl-11' : 'pl-4',
              rightElement ? 'pr-11' : 'pr-4',
              error
                ? 'border-status-danger focus:border-status-danger focus:ring-status-danger'
                : 'border-border-strong focus:border-accent-primary focus:ring-accent-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-status-danger text-xs mt-1.5">{error}</p>
        ) : hint ? (
          <p className="text-text-muted text-xs mt-1.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';