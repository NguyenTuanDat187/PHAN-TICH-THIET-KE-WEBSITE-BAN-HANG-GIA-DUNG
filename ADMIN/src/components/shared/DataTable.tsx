import type { ReactNode } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/data-display/Table';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  getRowId,
  loading = false,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.',
  className = '',
}: DataTableProps<T>) {
  return (
    <div
      className={`w-full min-w-0 overflow-hidden bg-bg-surface ${className}`}
    >
      <div
        className="w-full min-w-0 overflow-hidden" role="region"
        aria-label="Bảng dữ liệu"
        tabIndex={0}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`whitespace-nowrap ${column.headerClassName ?? ''} ${column.className ?? ''}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div
                    className="flex min-h-36 items-center justify-center gap-3 text-sm text-text-secondary"
                    role="status"
                  >
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-border-strong border-t-accent-primary" />
                    Đang tải dữ liệu...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex min-h-40 flex-col items-center justify-center px-4 py-8 text-center">
                    <p className="font-semibold text-text-primary">
                      {emptyTitle}
                    </p>
                    <p className="mt-1 max-w-md text-sm leading-6 text-text-secondary">
                      {emptyDescription}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.className}
                    >
                      {column.render(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}