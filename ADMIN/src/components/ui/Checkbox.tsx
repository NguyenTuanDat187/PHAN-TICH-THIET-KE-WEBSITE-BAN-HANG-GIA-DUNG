/**
 * Checkbox
 * --------
 * Ô chọn có label. Dùng cho filter, form, chọn hàng loạt.
 *
 * @example
 * <Checkbox label="Ghi nhớ đăng nhập" checked={v} onChange={...} />
 */
import { type InputHTMLAttributes, forwardRef } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <label htmlFor={checkboxId} className={cn('inline-flex items-center gap-2.5 cursor-pointer select-none', className)}>
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'peer appearance-none w-4 h-4 rounded border border-border-strong bg-bg-elevated',
              'checked:bg-accent-primary checked:border-accent-primary',
              'transition-all duration-app ease-app cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-app',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            {...props}
          />
          <Check
            size={12}
            strokeWidth={3}
            className="absolute text-black opacity-0 peer-checked:opacity-100 pointer-events-none"
          />
        </div>
        {label && <span className="text-text-secondary text-sm">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';