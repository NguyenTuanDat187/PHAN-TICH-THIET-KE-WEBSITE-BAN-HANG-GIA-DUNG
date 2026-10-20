
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [7, 10, 20, 50],
  className = '',
}: PaginationProps) {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * safePageSize + 1;
  const end = Math.min(currentPage * safePageSize, total);

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((item) => {
      return (
        item === 1 ||
        item === totalPages ||
        Math.abs(item - currentPage) <= 1
      );
    })
    .reduce<(number | 'ellipsis')[]>((result, item, index, items) => {
      if (index > 0 && item - items[index - 1] > 1) {
        result.push('ellipsis');
      }

      result.push(item);
      return result;
    }, []);

  return (
    <div
      className={`flex flex-col gap-4 border-t border-border-default pt-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
        <span>
          Hiển thị{' '}
          <span className="font-medium text-text-primary">{start}–{end}</span>
          {' '}trên{' '}
          <span className="font-medium text-text-primary">{total}</span>
          {' '}bản ghi
        </span>

        {onPageSizeChange && (
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap">Số dòng:</span>
            <select
              value={safePageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-9 rounded-lg border border-border-default bg-bg-surface px-2 text-sm text-text-primary outline-none focus:border-accent-primary"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav
        aria-label="Điều hướng phân trang"
        className="flex flex-wrap items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Trang trước"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={17} />
        </button>

        {pages.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 min-w-8 items-center justify-center text-text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Trang ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition-colors ${
                item === currentPage
                  ? 'bg-accent-primary text-black'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Trang sau"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={17} />
        </button>
      </nav>
    </div>
  );
}
