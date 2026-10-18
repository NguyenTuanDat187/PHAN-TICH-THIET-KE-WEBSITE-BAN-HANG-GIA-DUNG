/**
 * Textarea
 * --------
 * Ô nhập nhiều dòng. Có label, error, hint.
 *
 * @example
 * <Textarea label="Mô tả" rows={4} placeholder="Nhập mô tả..." />
 */
import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-text-secondary text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-4 py-3 rounded-btn text-sm min-h-[100px] resize-y',
            'bg-bg-elevated border text-text-primary placeholder:text-text-muted',
            'transition-all duration-app ease-app',
            'focus:outline-none focus:ring-1',
            error
              ? 'border-status-danger focus:border-status-danger focus:ring-status-danger'
              : 'border-border-strong focus:border-accent-primary focus:ring-accent-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-status-danger text-xs mt-1.5">{error}</p>
        ) : hint ? (
          <p className="text-text-muted text-xs mt-1.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';