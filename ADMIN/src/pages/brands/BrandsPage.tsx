
import {
  Activity,
  ArrowDownAZ,
  Building2,
  Globe,
  Package,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import ConfirmDialog from '../../components/shared/ConfirmDialog';
import DataTable, {
  type DataTableColumn,
} from '../../components/shared/DataTable';
import PageHeader from '../../components/shared/PageHeader';
import Pagination from '../../components/shared/Pagination';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/buttons/Button';
import Modal from '../../components/ui/overlays/Modal';
import { getBrands, saveBrands } from '../../mocks/brands.mock';
import type { Brand, BrandStatus } from '../../types/brand.types';

const PAGE_SIZE = 7;

type SortOption = 'name-asc' | 'name-desc' | 'products-desc';

interface BrandForm {
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  website: string;
  status: BrandStatus;
}

const EMPTY_FORM: BrandForm = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  website: '',
  status: 'active',
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return '';

  return /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(() => getBrands());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BrandStatus>(
    'all',
  );
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [formError, setFormError] = useState('');

  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  const activeCount = brands.filter(
    (brand) => brand.status === 'active',
  ).length;

  const inactiveCount = brands.length - activeCount;

  const totalProducts = brands.reduce(
    (total, brand) => total + brand.productCount,
    0,
  );

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const result = brands.filter((brand) => {
      const matchesSearch =
        !keyword ||
        brand.name.toLowerCase().includes(keyword) ||
        brand.slug.toLowerCase().includes(keyword) ||
        brand.description.toLowerCase().includes(keyword) ||
        brand.website.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'all' || brand.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name, 'vi');
      }

      if (sortBy === 'products-desc') {
        return b.productCount - a.productCount;
      }

      return a.name.localeCompare(b.name, 'vi');
    });
  }, [brands, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function updateBrands(nextBrands: Brand[]) {
    setBrands(nextBrands);
    saveBrands(nextBrands);
  }

  function openCreateModal() {
    setEditingBrand(null);
    setForm(EMPTY_FORM);
    setSlugEdited(false);
    setFormError('');
    setFormOpen(true);
  }

  function openEditModal(brand: Brand) {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logoUrl || brand.logo || '',
      website: brand.website,
      status: brand.status,
    });
    setSlugEdited(true);
    setFormError('');
    setFormOpen(true);
  }

  function closeFormModal() {
    setFormOpen(false);
    setEditingBrand(null);
    setFormError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const slug = createSlug(form.slug || name);

    if (!name) {
      setFormError('Vui lòng nhập tên thương hiệu.');
      return;
    }

    if (!slug) {
      setFormError('Slug không hợp lệ. Vui lòng nhập lại.');
      return;
    }

    const duplicate = brands.some(
      (brand) =>
        brand.slug.toLowerCase() === slug.toLowerCase() &&
        brand.id !== editingBrand?.id,
    );

    if (duplicate) {
      setFormError('Slug này đã được sử dụng bởi thương hiệu khác.');
      return;
    }

    const now = new Date().toISOString();

    if (editingBrand) {
      const updatedBrands = brands.map((brand) =>
        brand.id === editingBrand.id
          ? {
            ...brand,
            name,
            slug,
            description: form.description.trim(),
            logoUrl: form.logoUrl.trim(),
            logo: form.logoUrl.trim(),
            website: normalizeWebsite(form.website),
            status: form.status,
            updatedAt: now,
          }
          : brand,
      );

      updateBrands(updatedBrands);
    } else {
      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        name,
        slug,
        description: form.description.trim(),
        logoUrl: form.logoUrl.trim(),
        logo: form.logoUrl.trim(),
        website: normalizeWebsite(form.website),
        productCount: 0,
        status: form.status,
        createdAt: now,
        updatedAt: now,
      };

      updateBrands([newBrand, ...brands]);
      setPage(1);
    }

    closeFormModal();
  }

  function handleToggleStatus(brand: Brand) {
    const nextStatus: BrandStatus =
      brand.status === 'active' ? 'inactive' : 'active';

    updateBrands(
      brands.map((item) =>
        item.id === brand.id
          ? {
            ...item,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          }
          : item,
      ),
    );
  }

  function handleDelete() {
    if (!deletingBrand) return;

    updateBrands(
      brands.filter((brand) => brand.id !== deletingBrand.id),
    );

    setDeletingBrand(null);
    setPage((current) =>
      Math.max(
        1,
        Math.ceil(
          (filteredBrands.length - 1) / PAGE_SIZE,
        ),
      ) < current
        ? Math.max(
          1,
          Math.ceil((filteredBrands.length - 1) / PAGE_SIZE),
        )
        : current,
    );
  }

  const columns: DataTableColumn<Brand>[] = [
    {
      key: 'brand',
      header: 'THƯƠNG HIỆU',
      render: (brand) => {
        const logo = brand.logoUrl || brand.logo;

        return (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-bg-elevated">
              {logo ? (
                <img
                  src={logo}
                  alt={brand.name}
                  className="h-full w-full object-contain p-1.5"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Building2
                  size={20}
                  className="text-text-muted"
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                {brand.name}
              </p>
              <p className="mt-1 truncate text-xs text-text-muted">
                {brand.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'MÔ TẢ',
      render: (brand) => (
        <p
          className="max-w-64 truncate text-sm text-text-secondary"
          title={brand.description}
        >
          {brand.description || 'Chưa có mô tả'}
        </p>
      ),
    },
    {
      key: 'website',
      header: 'WEBSITE',
      render: (brand) =>
        brand.website ? (
          <a
            href={normalizeWebsite(brand.website)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-40 items-center gap-1.5 truncate text-sm text-accent-cyan transition-colors hover:text-accent-primary"
            onClick={(event) => event.stopPropagation()}
          >
            <Globe size={14} className="shrink-0" />
            <span className="truncate">
              {brand.website.replace(/^https?:\/\//i, '')}
            </span>
          </a>
        ) : (
          <span className="text-sm text-text-muted">Chưa cập nhật</span>
        ),
    },
    {
      key: 'productCount',
      header: 'SẢN PHẨM',
      render: (brand) => (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
          <Package size={15} className="text-text-muted" />
          {brand.productCount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'TRẠNG THÁI',
      render: (brand) => (
        <StatusBadge
          status={brand.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
          variant={brand.status === 'active' ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'updatedAt',
      header: 'CẬP NHẬT',
      render: (brand) => (
        <span className="whitespace-nowrap text-xs text-text-secondary">
          {formatDate(brand.updatedAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'THAO TÁC',
      render: (brand) => (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="icon"
            title="Chỉnh sửa thương hiệu"
            aria-label={`Chỉnh sửa ${brand.name}`}
            onClick={() => openEditModal(brand)}
          >
            <Pencil size={16} />
          </Button>

          <Button
            type="button"
            variant="icon"
            title={brand.status === 'active' ? 'Ngừng hoạt động' : 'Kích hoạt'}
            aria-label={
              brand.status === 'active'
                ? `Ngừng hoạt động ${brand.name}`
                : `Kích hoạt ${brand.name}`
            }
            onClick={() => handleToggleStatus(brand)}
          >
            <Power
              size={16}
              className={
                brand.status === 'active'
                  ? 'text-status-warning'
                  : 'text-status-success'
              }
            />
          </Button>

          <Button
            type="button"
            variant="icon"
            title="Xóa thương hiệu"
            aria-label={`Xóa ${brand.name}`}
            onClick={() => setDeletingBrand(brand)}
          >
            <Trash2 size={16} className="text-status-danger" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <PageHeader
          title="Quản lý thương hiệu"
          description="Theo dõi thông tin, trạng thái và danh sách thương hiệu sản phẩm."
          actions={
            <Button type="button" onClick={openCreateModal}>
              <Plus size={16} />
              Thêm thương hiệu
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <StatCard
              label="Tổng thương hiệu"
              value={String(brands.length)}
              icon={Building2}
              accent="primary"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Tổng số thương hiệu trong hệ thống
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Đang hoạt động"
              value={String(activeCount)}
              icon={Activity}
              accent="primary"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Có thể hiển thị và kinh doanh
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Ngừng hoạt động"
              value={String(inactiveCount)}
              icon={Power}
              accent="warning"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Đang tạm ngừng kinh doanh
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Sản phẩm liên kết"
              value={totalProducts.toLocaleString('vi-VN')}
              icon={Package}
              accent="cyan"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Tổng sản phẩm thuộc các thương hiệu
            </p>
          </div>
        </div>

        <section className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
          <div className="flex flex-col gap-3 border-b border-border-default p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text-primary">
                Danh sách thương hiệu
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                Hiển thị {filteredBrands.length} thương hiệu phù hợp
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 xl:w-155">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-border-default bg-bg-app px-3 focus-within:border-accent-primary">
                <Search size={16} className="shrink-0 text-text-muted" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm tên, slug, website..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Xóa nội dung tìm kiếm"
                    onClick={() => {
                      setSearch('');
                      setPage(1);
                    }}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>

              <div className="flex min-w-0 gap-2">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Lọc trạng thái</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(
                        event.target.value as 'all' | BrandStatus,
                      );
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-border-default bg-bg-app px-3 text-sm text-text-secondary outline-none focus:border-accent-primary"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </label>

                <label className="min-w-0 flex-1">
                  <span className="sr-only">Sắp xếp</span>
                  <span className="relative block">
                    <ArrowDownAZ
                      size={14}
                      className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(event.target.value as SortOption)
                      }
                      className="h-10 w-full appearance-none rounded-lg border border-border-default bg-bg-app pl-8 pr-2 text-sm text-text-secondary outline-none focus:border-accent-primary"
                    >
                      <option value="name-asc">Tên A–Z</option>
                      <option value="name-desc">Tên Z–A</option>
                      <option value="products-desc">Nhiều sản phẩm</option>
                    </select>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border-default px-3 py-3 text-[11px] text-text-muted sm:px-4">
            <span>
              Tất cả: <strong className="text-text-primary">{brands.length}</strong>
            </span>
            <span>
              Hoạt động:{' '}
              <strong className="text-status-success">{activeCount}</strong>
            </span>
            <span>
              Ngừng hoạt động:{' '}
              <strong className="text-status-danger">{inactiveCount}</strong>
            </span>
          </div>

          <div className="min-w-0 overflow-x-auto px-3 pb-3 sm:px-4">
            <div className="min-w-262.5">
              <DataTable<Brand>
  columns={columns}
  data={paginatedBrands}
  getRowId={(brand) => brand.id}
  emptyTitle="Không tìm thấy thương hiệu"
  emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
/>
            </div>
          </div>

          <div className="px-3 pb-4 sm:px-4">
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredBrands.length}
              onPageChange={setPage}
              onPageSizeChange={() => setPage(1)}
              pageSizeOptions={[PAGE_SIZE]}
            />
          </div>
        </section>
      </div>

      <Modal
        open={formOpen}
        onClose={closeFormModal}
        title={editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                Tên thương hiệu <span className="text-status-danger">*</span>
              </span>
              <input
                autoFocus
                required
                maxLength={120}
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;

                  setForm((current) => ({
                    ...current,
                    name,
                    slug: slugEdited ? current.slug : createSlug(name),
                  }));
                }}
                placeholder="Ví dụ: Sunhouse"
                className="h-10 w-full rounded-lg border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary"
              />
            </label>

            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                Slug <span className="text-status-danger">*</span>
              </span>
              <input
                required
                maxLength={140}
                value={form.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setForm((current) => ({
                    ...current,
                    slug: createSlug(event.target.value),
                  }));
                }}
                placeholder="sunhouse"
                className="h-10 w-full rounded-lg border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
              />
              <span className="mt-1 block text-xs text-text-muted">
                Dùng trong đường dẫn và định danh thương hiệu.
              </span>
            </label>

            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                URL logo
              </span>
              <input
                type="url"
                value={form.logoUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    logoUrl: event.target.value,
                  }))
                }
                placeholder="https://example.com/logo.png"
                className="h-10 w-full rounded-lg border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
              />
            </label>

            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                Website
              </span>
              <input
                type="text"
                value={form.website}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    website: event.target.value,
                  }))
                }
                placeholder="www.example.com"
                className="h-10 w-full rounded-lg border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
              />
            </label>

            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                Mô tả
              </span>
              <textarea
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Thông tin giới thiệu thương hiệu..."
                className="w-full resize-y rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
              />
            </label>

            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-text-secondary">
                Trạng thái
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as BrandStatus,
                  }))
                }
                className="h-10 w-full rounded-lg border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none focus:border-accent-primary"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </label>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-sm text-status-danger"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border-default pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={closeFormModal}
            >
              Hủy
            </Button>
            <Button type="submit">
              {editingBrand ? 'Lưu thay đổi' : 'Thêm thương hiệu'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingBrand)}
        title="Xóa thương hiệu"
        description={
          deletingBrand
            ? `Bạn có chắc muốn xóa thương hiệu "${deletingBrand.name}"? Thao tác này không thể hoàn tác.`
            : ''
        }
        confirmText="Xóa thương hiệu"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeletingBrand(null)}
      />
    </div>
  );
}
