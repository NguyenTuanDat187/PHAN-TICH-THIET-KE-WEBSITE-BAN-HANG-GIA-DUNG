
import { useEffect, useState } from 'react';
import {
  FolderTree,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from 'lucide-react';

import { Button } from '../../../components/ui/buttons/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/data-display/Table';

import type { Category } from '../../../types/category.types';

interface CategoryTableProps {
  categories: Category[];
  allCategories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
}

export default function CategoryTable({
  categories,
  allCategories,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);

  // Đóng menu khi danh sách thay đổi.
  useEffect(() => {
    setMenuId(null);
  }, [categories]);

  // Lấy tên danh mục cha.
  const getParentName = (parentId: string | null) => {
    if (!parentId) return 'Danh mục gốc';

    return (
      allCategories.find((item) => item.id === parentId)?.name ??
      'Không xác định'
    );
  };

  // Định dạng ngày tạo an toàn với dữ liệu ISO hoặc YYYY-MM-DD.
  const formatCreatedDate = (createdAt: string) => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(createdAt)
      ? new Date(`${createdAt}T00:00:00`)
      : new Date(createdAt);

    if (Number.isNaN(date.getTime())) return '—';

    return date.toLocaleDateString('vi-VN');
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated text-text-muted">
          <FolderTree size={25} />
        </div>

        <h3 className="font-semibold text-text-primary">
          Không tìm thấy danh mục
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-62.5">Danh mục</TableHead>
          <TableHead className="min-w-45">Danh mục cha</TableHead>
          <TableHead className="min-w-27.5">Sản phẩm</TableHead>
          <TableHead className="min-w-32.5">Trạng thái</TableHead>
          <TableHead className="min-w-30">Ngày tạo</TableHead>
          <TableHead className="w-16 text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            {/* Thông tin danh mục */}
            <TableCell>
              <div className="flex items-start gap-3 py-2">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-accent-primary">
                  <FolderTree size={18} />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-text-primary">
                    {category.name}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {category.slug}
                  </p>

                  {category.description && (
                    <p className="mt-1 max-w-xs truncate text-xs text-text-muted">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </TableCell>

            {/* Danh mục cha */}
            <TableCell>
              <span className="text-sm text-text-secondary">
                {getParentName(category.parentId)}
              </span>
            </TableCell>

            {/* Số lượng sản phẩm */}
            <TableCell>
              <span className="font-medium tabular-nums text-text-primary">
                {category.productCount.toLocaleString('vi-VN')}
              </span>

              <span className="ml-1 text-xs text-text-muted">
                sản phẩm
              </span>
            </TableCell>

            {/* Trạng thái */}
            <TableCell>
              <span
                className={
                  category.status === 'active'
                    ? 'inline-flex items-center gap-2 rounded-full border border-accent-primary/20 bg-accent-primary/10 px-2.5 py-1 text-xs font-medium text-accent-primary'
                    : 'inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-elevated px-2.5 py-1 text-xs font-medium text-text-muted'
                }
              >
                <span
                  className={
                    category.status === 'active'
                      ? 'h-1.5 w-1.5 rounded-full bg-accent-primary'
                      : 'h-1.5 w-1.5 rounded-full bg-text-muted'
                  }
                />

                {category.status === 'active' ? 'Hoạt động' : 'Đã tắt'}
              </span>
            </TableCell>

            {/* Ngày tạo */}
            <TableCell>
              <span className="text-sm text-text-muted">
                {formatCreatedDate(category.createdAt)}
              </span>
            </TableCell>

            {/* Menu thao tác */}
            <TableCell>
              <div className="relative flex justify-end">
                <Button
                  type="button"
                  variant="icon"
                  aria-label={`Thao tác với ${category.name}`}
                  aria-expanded={menuId === category.id}
                  onClick={() =>
                    setMenuId((current) =>
                      current === category.id ? null : category.id,
                    )
                  }
                >
                  <MoreHorizontal size={18} />
                </Button>

                {menuId === category.id && (
                  <>
                    <button
                      type="button"
                      aria-label="Đóng menu thao tác"
                      className="fixed inset-0 z-20 cursor-default"
                      onClick={() => setMenuId(null)}
                    />

                    <div className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-border-default bg-bg-elevated p-1.5 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuId(null);
                          onEdit(category);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                      >
                        <Pencil size={15} />
                        Chỉnh sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuId(null);
                          onToggleStatus(category);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-text-secondary transition hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                      >
                        <Power size={15} />

                        {category.status === 'active'
                          ? 'Ngừng hoạt động'
                          : 'Kích hoạt'}
                      </button>

                      <div className="my-1 border-t border-border-default" />

                      <button
                        type="button"
                        onClick={() => {
                          setMenuId(null);
                          onDelete(category);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-status-danger transition hover:bg-status-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                      >
                        <Trash2 size={15} />
                        Xóa danh mục
                      </button>
                    </div>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
