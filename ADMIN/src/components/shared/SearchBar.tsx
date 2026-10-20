
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className = '',
  disabled = false,
  ariaLabel = 'Tìm kiếm',
}: SearchBarProps) {
  return (
    <div
      className={`flex h-11 min-w-0 items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-3 transition-colors focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/15 ${className}`}
    >
      <Search
        size={18}
        className="shrink-0 text-text-muted"
        aria-hidden="true"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        disabled={disabled}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Xóa nội dung tìm kiếm"
          className="rounded-md p-1 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
