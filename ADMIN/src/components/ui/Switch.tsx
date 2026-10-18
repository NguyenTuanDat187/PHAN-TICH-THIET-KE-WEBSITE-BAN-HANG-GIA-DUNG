/**
 * Switch
 * ------
 * Công tắc bật/tắt (giống toggle iOS). Controlled component.
 *
 * @example
 * <Switch label="Bật thông báo" checked={v} onChange={...} />
 */
import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, id, checked, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2)}`;

    return (
      <label htmlFor={switchId} className={cn('inline-flex items-center gap-3 cursor-pointer select-none', className)}>
        <div className="relative">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'w-10 h-6 rounded-full border-2 border-transparent',
              'bg-bg-elevated border-border-strong transition-colors duration-app',
              'peer-checked:bg-accent-primary peer-checked:border-accent-primary',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-app'
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm',
              'transition-transform duration-app ease-app pointer-events-none',
              'peer-checked:translate-x-4'
            )}
          />
        </div>
        {label && <span className="text-text-secondary text-sm">{label}</span>}
      </label>
    );
  }
);
Switch.displayName = 'Switch';