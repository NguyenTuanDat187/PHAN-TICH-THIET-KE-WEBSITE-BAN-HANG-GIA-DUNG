
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Layers3,
  Package,
  Plus,
  Search,
  Tags,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/buttons/Button';
import {
  Card,
  CardBody,
} from '../../components/ui/data-display/Card';
import { Input } from '../../components/ui/forms/Input';
import { mockCategories } from '../../mocks/categories.mock';
import type {
  Category,
  CategoryFormValues,
} from '../../types/category.types';
import CategoryFormModal from './components/CategoryFormModal';
import CategoryTable from './components/CategoryTable';

type StatusFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 7;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(() =>
    mockCategories.map((item) => ({ ...item })),
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const stats = useMemo(() => {
    const active = categories.filter(
      (item) => item.status === 'active',
    ).length;

    const totalProducts = categories.reduce(
      (sum, item) => sum + item.productCount,
      0,
    );

    const rootCategories = categories.filter(
      (item) => item.parentId === null,
    ).length;

    return {
      total: categories.length,
      active,
      inactive: categories.length - active,
      totalProducts,
      rootCategories,
    };
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');

    return categories.filter((category) => {
      const matchesSearch =
        !keyword ||
        category.name.toLocaleLowerCase('vi').includes(keyword) ||
        category.slug.toLowerCase().includes(keyword) ||
        category.description.toLocaleLowerCase('vi').includes(keyword);

      const matchesStatus =
        statusFilter === 'all' || category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / PAGE_SIZE),
  );

  const safePage = Math.min(page, totalPages);

  const paginatedCategories = filteredCategories.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const openCreateModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const saveCategory = (values: CategoryFormValues) => {
    if (editingCategory) {
      setCategories((current) =>
        current.map((item) =>
          item.id === editingCategory.id
            ? { ...item, ...values }
            : item,
        ),
      );
    } else {
      const newCategory: Category = {
        ...values,
        id: `CAT-${Date.now()}`,
        productCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setCategories((current) => [newCategory, ...current]);
      setPage(1);
    }

    setModalOpen(false);
    setEditingCategory(null);
  };

  const deleteCategory = (category: Category) => {
    const childCategories = categories.filter(
      (item) => item.parentId === category.id,
    );

    const message = childCategories.length
      ? `Danh mục "${category.name}" đang có ${childCategories.length} danh mục con. Xóa danh mục này sẽ chuyển các danh mục con thành danh mục gốc. Tiếp tục?`
      : `Mày có chắc muốn xóa danh mục "${category.name}" khỏi dữ liệu mẫu hiện tại không?`;

    if (!window.confirm(message)) return;

    setCategories((current) =>
      current
        .filter((item) => item.id !== category.id)
        .map((item) =>
          item.parentId === category.id
            ? { ...item, parentId: null }
            : item,
        ),
    );
  };

  const toggleStatus = (category: Category) => {
    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? {
              ...item,
              status:
                item.status === 'active' ? 'inactive' : 'active',
            }
          : item,
      ),
    );
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const changeStatus = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="min-h-full bg-bg-app px-4 py-6 text-text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-text-muted">
              <span>Quản lý cửa hàng</span>
              <span>/</span>
              <span className="text-text-secondary">Danh mục</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              Quản lý danh mục
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">
              Tổ chức danh mục sản phẩm, quản lý danh mục cha và danh mục con,
              theo dõi trạng thái hiển thị.
            </p>
          </div>

          <Button onClick={openCreateModal}>
            <Plus size={17} />
            Thêm danh mục
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardBody className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-text-secondary">
                  Tổng danh mục
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {stats.total}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Tất cả danh mục
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-accent-primary">
                <Layers3 size={21} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-text-secondary">
                  Đang hoạt động
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {stats.active}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Danh mục đang bật
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-primary/20 bg-accent-primary/10 text-accent-primary">
                <CheckCircle2 size={21} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-text-secondary">
                  Danh mục gốc
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {stats.rootCategories}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Cấp cao nhất
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-cyan-400">
                <FolderTree size={21} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-text-secondary">
                  Sản phẩm thuộc danh mục
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {stats.totalProducts.toLocaleString('vi-VN')}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Tổng theo dữ liệu mẫu
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-violet-400">
                <Package size={21} />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main table */}
        <Card>
          <div className="flex flex-col justify-between gap-4 border-b border-border-default px-5 py-5 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-semibold text-text-primary">
                Danh sách danh mục
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Tìm kiếm, lọc và quản lý danh mục sản phẩm.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="w-full sm:w-72">
                <Input
                  aria-label="Tìm kiếm danh mục"
                  placeholder="Tìm tên, slug, mô tả..."
                  value={search}
                  onChange={(event) => changeSearch(event.target.value)}
                  icon={<Search size={16} />}
                  rightElement={
                    search ? (
                      <button
                        type="button"
                        aria-label="Xóa từ khóa tìm kiếm"
                        onClick={() => changeSearch('')}
                        className="hover:text-text-primary"
                      >
                        <X size={15} />
                      </button>
                    ) : undefined
                  }
                />
              </div>

              <div className="relative min-w-45">
                <select
                  aria-label="Lọc theo trạng thái"
                  value={statusFilter}
                  onChange={(event) =>
                    changeStatus(event.target.value as StatusFilter)
                  }
                  className="h-input w-full appearance-none rounded-btn border border-border-strong bg-bg-elevated py-0 pl-4 pr-10 text-sm text-text-primary outline-none transition focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Ngừng hoạt động</option>
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default bg-bg-surface px-5 py-3">
            <p className="text-sm text-text-secondary">
              Hiển thị{' '}
              <span className="font-semibold text-text-primary">
                {filteredCategories.length === 0
                  ? 0
                  : (safePage - 1) * PAGE_SIZE + 1}
                {'–'}
                {Math.min(safePage * PAGE_SIZE, filteredCategories.length)}
              </span>{' '}
              trong{' '}
              <span className="font-semibold text-text-primary">
                {filteredCategories.length}
              </span>{' '}
              danh mục
            </p>

            {(search || statusFilter !== 'all') && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                <X size={14} />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <CategoryTable
            categories={paginatedCategories}
            allCategories={categories}
            onEdit={openEditModal}
            onDelete={deleteCategory}
            onToggleStatus={toggleStatus}
          />

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-border-default px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-text-muted">
              Trang {safePage} / {totalPages}
            </p>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9! px-3!"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    Math.abs(number - safePage) <= 1,
                )
                .map((number, index, numbers) => (
                  <span key={number} className="contents">
                    {index > 0 && number - numbers[index - 1] > 1 && (
                      <span className="px-1 text-text-muted">…</span>
                    )}
                    <Button
                      type="button"
                      variant={number === safePage ? 'primary' : 'secondary'}
                      className="h-9! w-9! px-0!"
                      aria-label={`Trang ${number}`}
                      aria-current={number === safePage ? 'page' : undefined}
                      onClick={() => setPage(number)}
                    >
                      {number}
                    </Button>
                  </span>
                ))}

              <Button
                type="button"
                variant="secondary"
                className="h-9! px-3!"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-xs text-text-muted">
          <Tags size={13} className="mr-1 inline-block" />
          Dữ liệu hiện tại là dữ liệu mẫu. Các thay đổi chỉ tồn tại trong state
          của trang và sẽ mất khi tải lại trình duyệt.
        </p>
      </div>

      <CategoryFormModal
        open={modalOpen}
        category={editingCategory}
        categories={categories}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={saveCategory}
      />
    </div>
  );
}
