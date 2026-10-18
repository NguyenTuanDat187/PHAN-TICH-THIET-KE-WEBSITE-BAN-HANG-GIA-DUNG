/**
 * Breadcrumb
 * ----------
 * Điều hướng phân cấp. Dùng ở đầu trang detail/edit để user biết
 * đang ở đâu và quay lại được.
 *
 * @example
 * <Breadcrumb items={[
 *   { label: 'Dashboard', href: '/dashboard' },
 *   { label: 'Products', href: '/products' },
 *   { label: 'Chi tiết' },   // item cuối không cần href
 * ]} />
 */
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-1.5 text-sm', className)}>
      <Link to="/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
        <Home size={14} />
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-text-muted" />
            {isLast || !item.href ? (
              <span className="text-text-primary font-medium">{item.label}</span>
            ) : (
              <Link
                to={item.href}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}