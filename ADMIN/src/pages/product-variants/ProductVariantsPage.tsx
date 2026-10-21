
import {
  Layers3,
  Package,
  Pencil,
  Plus,
  Trash2,
  Warehouse,
  X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import ConfirmDialog from '../../components/shared/ConfirmDialog';
import DataTable, {
  type DataTableColumn,
} from '../../components/shared/DataTable';
import FilterBar from '../../components/shared/FilterBar';
import PageHeader from '../../components/shared/PageHeader';
import Pagination from '../../components/shared/Pagination';
import SearchBar from '../../components/shared/SearchBar';
import StatCard from '../../components/shared/StatCard';
import { Button } from '../../components/ui/buttons/Button';
import Modal from '../../components/ui/overlays/Modal';
import {
  productVariantsMock,
  productVariantProductsMock,
} from '../../mocks/product-variants.mock';
import type { ProductVariant } from '../../types/product-variant.types';

type StatusFilter = 'all' | 'active' | 'inactive' | 'out-of-stock';

const PAGE_SIZE = 7;

const currency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const initialForm = {
  product_id: 1,
  sku: '',
  price: 0,
  compare_at_price: '',
  stock_quantity: 0,
  weight: '',
  is_active: true,
};

const inputClassName =
  'w-full rounded-lg border border-border-strong bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15';

const labelClassName =
  'block text-sm font-medium text-text-secondary';

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>(
    productVariantsMock,
  );

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] =
    useState<ProductVariant | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ProductVariant | null>(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const stats = useMemo(
    () => ({
      total: variants.length,
      active: variants.filter((item) => item.is_active).length,
      lowStock: variants.filter(
        (item) =>
          item.is_active &&
          item.stock_quantity > 0 &&
          item.stock_quantity <= 10,
      ).length,
      outOfStock: variants.filter(
        (item) => item.stock_quantity === 0,
      ).length,
    }),
    [variants],
  );

  const filteredVariants = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return variants.filter((item) => {
      const matchesKeyword =
        item.sku.toLowerCase().includes(normalizedKeyword) ||
        item.product_name.toLowerCase().includes(normalizedKeyword);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.is_active) ||
        (statusFilter === 'inactive' && !item.is_active) ||
        (statusFilter === 'out-of-stock' &&
          item.stock_quantity === 0);

      return matchesKeyword && matchesStatus;
    });
  }, [variants, keyword, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVariants.length / pageSize),
  );

  const safePage = Math.min(page, totalPages);

  const paginatedVariants = useMemo(
    () =>
      filteredVariants.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
      ),
    [filteredVariants, safePage, pageSize],
  );

  const hasActiveFilters =
    keyword.trim() !== '' || statusFilter !== 'all';

  const resetFilters = () => {
    setKeyword('');
    setStatusFilter('all');
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingVariant(null);
    setForm({
      ...initialForm,
      product_id: productVariantProductsMock[0]?.id ?? 1,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setForm({
      product_id: variant.product_id,
      sku: variant.sku,
      price: variant.price,
      compare_at_price:
        variant.compare_at_price == null
          ? ''
          : String(variant.compare_at_price),
      stock_quantity: variant.stock_quantity,
      weight: variant.weight == null ? '' : String(variant.weight),
      is_active: variant.is_active,
    });
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingVariant(null);
    setError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sku = form.sku.trim();
    const price = Number(form.price);
    const stock = Number(form.stock_quantity);

    const compareAtPrice =
      form.compare_at_price.trim() === ''
        ? null
        : Number(form.compare_at_price);

    const weight =
      form.weight.trim() === '' ? null : Number(form.weight);

    if (!sku) {
      setError('Vui lòng nhập mã SKU.');
      return;
    }

    const duplicatedSku = variants.some(
      (item) =>
        item.sku.toLowerCase() === sku.toLowerCase() &&
        item.id !== editingVariant?.id,
    );

    if (duplicatedSku) {
      setError('Mã SKU đã tồn tại. Vui lòng nhập mã khác.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Giá bán phải lớn hơn 0.');
      return;
    }

    if (
      compareAtPrice !== null &&
      (!Number.isFinite(compareAtPrice) || compareAtPrice < price)
    ) {
      setError('Giá so sánh phải lớn hơn hoặc bằng giá bán.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Số lượng tồn kho phải là số nguyên không âm.');
      return;
    }

    if (
      weight !== null &&
      (!Number.isFinite(weight) || weight < 0)
    ) {
      setError('Khối lượng không được là số âm.');
      return;
    }

    const product = productVariantProductsMock.find(
      (item) => item.id === Number(form.product_id),
    );

    if (!product) {
      setError('Vui lòng chọn sản phẩm.');
      return;
    }

    const nextVariant: ProductVariant = {
      id:
        editingVariant?.id ??
        Math.max(0, ...variants.map((item) => item.id)) + 1,
      product_id: product.id,
      product_name: product.name,
      sku,
      price,
      compare_at_price: compareAtPrice,
      stock_quantity: stock,
      weight,
      image: editingVariant?.image ?? null,
      is_active: form.is_active,
    };

    if (editingVariant) {
      setVariants((current) =>
        current.map((item) =>
          item.id === editingVariant.id ? nextVariant : item,
        ),
      );
    } else {
      setVariants((current) => [nextVariant, ...current]);
      setPage(1);
    }

    closeModal();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    setVariants((current) =>
      current.filter((item) => item.id !== deleteTarget.id),
    );

    setDeleteTarget(null);
  };

  const columns: DataTableColumn<ProductVariant>[] = [
    {
      key: 'variant',
      header: 'Biến thể / SKU',
      render: (variant) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-text-primary">
            {variant.sku}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            ID biến thể: #{variant.id}
          </p>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Sản phẩm',
      render: (variant) => (
        <span className="line-clamp-2 text-text-secondary">
          {variant.product_name}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Giá bán',
      render: (variant) => (
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">
            {currency(variant.price)}
          </p>
          {variant.compare_at_price !== null && (
            <p className="mt-1 text-xs text-text-muted line-through">
              {currency(variant.compare_at_price)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Tồn kho',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (variant) => (
        <span
          className={
            variant.stock_quantity === 0
              ? 'font-semibold text-status-danger'
              : variant.stock_quantity <= 10
                ? 'font-semibold text-amber-400'
                : 'font-medium text-text-primary'
          }
        >
          {variant.stock_quantity}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (variant) => (
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
            variant.is_active
              ? 'bg-accent-primary/10 text-accent-primary'
              : 'bg-bg-hover text-text-muted'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              variant.is_active
                ? 'bg-accent-primary'
                : 'bg-text-muted'
            }`}
          />
          {variant.is_active ? 'Đang bán' : 'Ngừng bán'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (variant) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="icon"
            aria-label={`Sửa ${variant.sku}`}
            title="Chỉnh sửa"
            onClick={() => openEditModal(variant)}
          >
            <Pencil size={16} />
          </Button>

          <Button
            type="button"
            variant="icon"
            aria-label={`Xóa ${variant.sku}`}
            title="Xóa biến thể"
            onClick={() => setDeleteTarget(variant)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        <PageHeader
          eyebrow="QUẢN LÝ SẢN PHẨM"
          title="Biến thể sản phẩm"
          description="Quản lý SKU, giá bán và số lượng tồn kho của từng biến thể."
          actions={
            <Button type="button" onClick={openCreateModal}>
              <Plus size={18} />
              Thêm biến thể
            </Button>
          }
        />

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <StatCard
              label="Tổng biến thể"
              value={String(stats.total)}
              icon={Layers3}
              accent="primary"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Tổng số SKU đang được quản lý
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Đang kinh doanh"
              value={String(stats.active)}
              icon={Package}
              accent="cyan"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Biến thể được bật trạng thái kinh doanh
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Sắp hết hàng"
              value={String(stats.lowStock)}
              icon={Warehouse}
              accent="warning"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Còn từ 1 đến 10 sản phẩm trong kho
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Hết hàng"
              value={String(stats.outOfStock)}
              icon={Trash2}
              accent="purple"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Biến thể có số lượng tồn kho bằng 0
            </p>
          </div>
        </div>

        {/* Danh sách và bộ lọc */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
          <div className="flex flex-col gap-3 border-b border-border-default p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h2 className="font-semibold text-text-primary">
                Danh sách biến thể
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Tìm kiếm và quản lý thông tin SKU, giá bán, tồn kho.
              </p>
            </div>

            <div className="min-w-0 xl:w-155">
              <FilterBar
                onReset={resetFilters}
                showReset={hasActiveFilters}
                resetLabel="Xóa bộ lọc"
                className="rounded-lg p-2"
              >
                <div className="w-full min-w-0 sm:flex-1">
                  <SearchBar
                    value={keyword}
                    onChange={(value) => {
                      setKeyword(value);
                      setPage(1);
                    }}
                    placeholder="Tìm SKU, tên sản phẩm..."
                    className="w-full"
                    ariaLabel="Tìm kiếm biến thể sản phẩm"
                  />
                </div>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-text-secondary sm:min-w-36.25">
                  <span>Trạng thái</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(
                        event.target.value as StatusFilter,
                      );
                      setPage(1);
                    }}
                    aria-label="Lọc trạng thái biến thể"
                    className="h-10 w-full rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang bán</option>
                    <option value="inactive">Ngừng bán</option>
                    <option value="out-of-stock">Hết hàng</option>
                  </select>
                </label>
              </FilterBar>
            </div>
          </div>

          {/* Thông tin kết quả */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-[11px] text-text-muted sm:px-4">
            <p>
              Hiển thị{' '}
              <span className="font-semibold text-text-secondary">
                {filteredVariants.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –
                {Math.min(safePage * pageSize, filteredVariants.length)}
              </span>{' '}
              trên{' '}
              <span className="font-semibold text-text-secondary">
                {filteredVariants.length}
              </span>{' '}
              biến thể
            </p>

            {hasActiveFilters && (
              <p className="text-accent-primary">
                Đang áp dụng bộ lọc
              </p>
            )}
          </div>

          {/* Bảng dữ liệu */}
          <div className="min-w-0 overflow-x-auto px-3 pb-3 sm:px-4">
            <div className="min-w-[850px]">
              <DataTable
                columns={columns}
                data={paginatedVariants}
                getRowId={(variant) => variant.id}
                emptyTitle="Không tìm thấy biến thể"
                emptyDescription="Thử thay đổi từ khóa hoặc bộ lọc, hoặc thêm biến thể mới."
              />
            </div>
          </div>

          {/* Phân trang */}
          <div className="px-3 pb-4 sm:px-4">
            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filteredVariants.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[5, 7, 10, 20]}
            />
          </div>
        </section>

        {/* Modal thêm / chỉnh sửa */}
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={
            editingVariant ? 'Chỉnh sửa biến thể' : 'Thêm biến thể'
          }
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className={labelClassName}>
                  Sản phẩm <span className="text-status-danger">*</span>
                </span>
                <select
                  required
                  value={form.product_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      product_id: Number(event.target.value),
                    }))
                  }
                  className={inputClassName}
                >
                  {productVariantProductsMock.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>
                  Mã SKU <span className="text-status-danger">*</span>
                </span>
                <input
                  required
                  value={form.sku}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sku: event.target.value,
                    }))
                  }
                  placeholder="VD: NCD-6L-BLK"
                  className={inputClassName}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>
                  Giá bán (VNĐ){' '}
                  <span className="text-status-danger">*</span>
                </span>
                <input
                  required
                  type="number"
                  min="1"
                  step="1000"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      price: Number(event.target.value),
                    }))
                  }
                  className={inputClassName}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>
                  Giá so sánh (VNĐ)
                </span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.compare_at_price}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      compare_at_price: event.target.value,
                    }))
                  }
                  placeholder="Không bắt buộc"
                  className={inputClassName}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>
                  Số lượng tồn kho
                </span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock_quantity}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      stock_quantity: Number(event.target.value),
                    }))
                  }
                  className={inputClassName}
                />
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>
                  Khối lượng (kg)
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      weight: event.target.value,
                    }))
                  }
                  placeholder="Không bắt buộc"
                  className={inputClassName}
                />
              </label>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-default bg-bg-app p-3 transition-colors hover:border-border-strong">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_active: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#65D928]"
              />
              <span>
                <span className="block text-sm font-medium text-text-primary">
                  Kinh doanh biến thể
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  Cho phép biến thể được đánh dấu đang bán.
                </span>
              </span>
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-sm text-status-danger"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-border-default pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
              >
                <X size={16} />
                Hủy
              </Button>

              <Button type="submit">
                {editingVariant ? 'Lưu thay đổi' : 'Tạo biến thể'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Xác nhận xóa */}
        <ConfirmDialog
          open={deleteTarget !== null}
          title="Xóa biến thể sản phẩm?"
          description={
            deleteTarget
              ? `Bạn có chắc muốn xóa biến thể "${deleteTarget.sku}"? Thao tác này sẽ chỉ xóa dữ liệu trong giao diện hiện tại.`
              : ''
          }
          confirmText="Xóa biến thể"
          cancelText="Hủy"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}
