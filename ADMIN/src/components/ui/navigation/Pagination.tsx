/**
 * Pagination
 * -----------
 * Phân trang danh sách. Hỗ trợ hiển thị số trang + rút gọn dấu "..."
 * khi có nhiều trang.
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={20}
 *   onPageChange={(p) => setPage(p)}
 * />
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const getPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const btnClass = (active = false, disabled = false) =>
    cn(
      'inline-flex items-center justify-center w-9 h-9 rounded-btn text-sm font-medium',
      'transition-all duration-app ease-app',
      active
        ? 'bg-accent-primary text-black'
        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
      disabled && 'opacity-40 pointer-events-none'
    );

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        className={btnClass(false, currentPage === 1)}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-text-muted text-sm">...</span>
        ) : (
          <button
            key={p}
            className={btnClass(p === currentPage)}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className={btnClass(false, currentPage === totalPages)}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}