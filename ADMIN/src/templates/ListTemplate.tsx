
import type { ReactNode } from 'react';

import PageHeader from '../components/shared/PageHeader';

interface ListTemplateProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function ListTemplate({
  title,
  description,
  eyebrow,
  actions,
  stats,
  toolbar,
  children,
  footer,
  className = '',
}: ListTemplateProps) {
  return (
    <div className={`min-w-0 space-y-6 ${className}`}>
      <PageHeader
        title={title}
        description={description}
        eyebrow={eyebrow}
        actions={actions}
      />

      {stats && (
        <section
          aria-label="Thống kê tổng quan"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {stats}
        </section>
      )}

      {toolbar && (
        <section aria-label="Tìm kiếm và bộ lọc">
          {toolbar}
        </section>
      )}

      <section className="min-w-0 overflow-hidden rounded-card border border-border-default bg-bg-surface">
        {children}
      </section>

      {footer && (
        <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </footer>
      )}
    </div>
  );
}
