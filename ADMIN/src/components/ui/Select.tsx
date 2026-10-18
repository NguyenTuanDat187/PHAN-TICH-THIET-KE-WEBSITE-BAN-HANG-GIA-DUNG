/**
 * Select
 * ------
 * Dropdown chọn giá trị. Có label + error.
 *
 * @example
 * <Select
 *   label="Danh mục"
 *   options={[{ value: '1', label: 'Điện thoại' }]}
 *   value={v}
 *   onChange={...}
 * />
 */
import { type SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-text-secondary text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-input px-4 pr-10 rounded-btn text-sm appearance-none cursor-pointer',
              'bg-bg-elevated border text-text-primary',
              'transition-all duration-app ease-app',
              'focus:outline-none focus:ring-1',
              error
                ? 'border-status-danger focus:border-status-danger focus:ring-status-danger'
                : 'border-border-strong focus:border-accent-primary focus:ring-accent-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
        {error && <p className="text-status-danger text-xs mt-1.5">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';