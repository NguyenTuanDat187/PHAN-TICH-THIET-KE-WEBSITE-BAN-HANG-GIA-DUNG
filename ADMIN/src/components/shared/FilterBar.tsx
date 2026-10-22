
import type { ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  showReset?: boolean;
  className?: string;
}

export default function FilterBar({
  children,
  onReset,
  resetLabel = 'Xóa bộ lọc',
  showReset = true,
  className = '',
}: FilterBarProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        {children}
      </div>

      {showReset && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          <RotateCcw size={15} />
          {resetLabel}
        </button>
      )}
    </div>
  );
}
