
import {
  CalendarDays,
  Film,
  Image as ImageIcon,
  Images,
  Pencil,
  Plus,
  Star,
  Trash2,
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
  productMediaMock,
  productMediaProductsMock,
} from '../../mocks/product-media.mock';
import type {
  MediaType,
  ProductMedia,
  ProductMediaFormData,
} from '../../types/product-media.types';

type TypeFilter = 'all' | MediaType;
type PrimaryFilter = 'all' | 'primary' | 'secondary';

const PAGE_SIZE = 7;

const inputClassName =
  'w-full rounded-lg border border-border-strong bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15';

const labelClassName =
  'block text-sm font-medium text-text-secondary';

const initialForm: ProductMediaFormData = {
  product_id: 1,
  media_type: 'image',
  media_url: '',
  alt_text: '',
  sort_order: 1,
  is_primary: false,
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));

const getProduct = (productId: number) =>
  productMediaProductsMock.find((product) => product.id === productId);

export default function ProductMediaPage() {
  const [media, setMedia] = useState<ProductMedia[]>(productMediaMock);

  const [keyword, setKeyword] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [primaryFilter, setPrimaryFilter] =
    useState<PrimaryFilter>('all');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] =
    useState<ProductMedia | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ProductMedia | null>(null);

  const [previewTarget, setPreviewTarget] =
    useState<ProductMedia | null>(null);

  const [form, setForm] = useState<ProductMediaFormData>({
    ...initialForm,
    product_id: productMediaProductsMock[0]?.id ?? 1,
  });

  const [error, setError] = useState('');

  const stats = useMemo(
    () => ({
      total: media.length,
      images: media.filter((item) => item.media_type === 'image').length,
      videos: media.filter((item) => item.media_type === 'video').length,
      primary: media.filter((item) => item.is_primary).length,
    }),
    [media],
  );

  const filteredMedia = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return media
      .filter((item) => {
        const product = getProduct(item.product_id);

        const matchesKeyword = [
          item.media_url,
          item.alt_text ?? '',
          product?.name ?? '',
          product?.sku ?? '',
        ].some((value) => value.toLowerCase().includes(normalizedKeyword));

        const matchesProduct =
          productFilter === 'all' ||
          item.product_id === Number(productFilter);

        const matchesType =
          typeFilter === 'all' || item.media_type === typeFilter;

        const matchesPrimary =
          primaryFilter === 'all' ||
          (primaryFilter === 'primary' && item.is_primary) ||
          (primaryFilter === 'secondary' && !item.is_primary);

        return (
          matchesKeyword &&
          matchesProduct &&
          matchesType &&
          matchesPrimary
        );
      })
      .sort((a, b) => {
        if (a.product_id !== b.product_id) {
          return a.product_id - b.product_id;
        }

        if (a.is_primary !== b.is_primary) {
          return a.is_primary ? -1 : 1;
        }

        return a.sort_order - b.sort_order;
      });
  }, [media, keyword, productFilter, typeFilter, primaryFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMedia.length / pageSize),
  );

  const safePage = Math.min(page, totalPages);

  const paginatedMedia = useMemo(
    () =>
      filteredMedia.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
      ),
    [filteredMedia, safePage, pageSize],
  );

  const hasActiveFilters =
    keyword.trim() !== '' ||
    productFilter !== 'all' ||
    typeFilter !== 'all' ||
    primaryFilter !== 'all';

  const resetFilters = () => {
    setKeyword('');
    setProductFilter('all');
    setTypeFilter('all');
    setPrimaryFilter('all');
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingMedia(null);

    setForm({
      ...initialForm,
      product_id: productMediaProductsMock[0]?.id ?? 1,
      sort_order:
        Math.max(
          0,
          ...media
            .filter(
              (item) =>
                item.product_id ===
                (productMediaProductsMock[0]?.id ?? 1),
            )
            .map((item) => item.sort_order),
        ) + 1,
    });

    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item: ProductMedia) => {
    setEditingMedia(item);

    setForm({
      product_id: item.product_id,
      media_type: item.media_type,
      media_url: item.media_url,
      alt_text: item.alt_text ?? '',
      sort_order: item.sort_order,
      is_primary: item.is_primary,
    });

    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMedia(null);
    setError('');
  };

  const handleProductChange = (productId: number) => {
    setForm((current) => ({
      ...current,
      product_id: productId,
      is_primary:
        current.product_id === productId ? current.is_primary : false,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const mediaUrl = form.media_url.trim();
    const altText = form.alt_text.trim();

    if (!productMediaProductsMock.some(
      (product) => product.id === Number(form.product_id),
    )) {
      setError('Vui lòng chọn sản phẩm hợp lệ.');
      return;
    }

    if (!mediaUrl) {
      setError('Vui lòng nhập đường dẫn media.');
      return;
    }

    try {
      const parsedUrl = new URL(mediaUrl);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        setError('Đường dẫn phải sử dụng giao thức HTTP hoặc HTTPS.');
        return;
      }
    } catch {
      setError('Đường dẫn media không hợp lệ.');
      return;
    }

    if (
      !Number.isInteger(Number(form.sort_order)) ||
      Number(form.sort_order) < 0
    ) {
      setError('Thứ tự hiển thị phải là số nguyên không âm.');
      return;
    }

    const duplicatePrimary =
      form.is_primary &&
      media.some(
        (item) =>
          item.product_id === Number(form.product_id) &&
          item.is_primary &&
          item.id !== editingMedia?.id,
      );

    const nextMedia: ProductMedia = {
      id:
        editingMedia?.id ??
        Math.max(0, ...media.map((item) => item.id)) + 1,
      product_id: Number(form.product_id),
      media_type: form.media_type,
      media_url: mediaUrl,
      alt_text: altText || null,
      sort_order: Number(form.sort_order),
      is_primary: form.is_primary,
      created_at:
        editingMedia?.created_at ?? new Date().toISOString(),
    };

    setMedia((current) => {
      let updated = current.map((item) => {
        if (item.id === nextMedia.id) {
          return nextMedia;
        }

        if (
          nextMedia.is_primary &&
          item.product_id === nextMedia.product_id
        ) {
          return { ...item, is_primary: false };
        }

        return item;
      });

      if (!editingMedia) {
        updated = [nextMedia, ...updated];
      }

      // Chỉ duy trì một media chính cho mỗi sản phẩm.
      if (duplicatePrimary) {
        updated = updated.map((item) =>
          item.product_id === nextMedia.product_id
            ? { ...item, is_primary: item.id === nextMedia.id }
            : item,
        );
      }

      return updated;
    });

    closeModal();
  };

  const handleSetPrimary = (target: ProductMedia) => {
    setMedia((current) =>
      current.map((item) => {
        if (item.product_id !== target.product_id) return item;

        return {
          ...item,
          is_primary: item.id === target.id,
        };
      }),
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    setMedia((current) =>
      current.filter((item) => item.id !== deleteTarget.id),
    );

    setDeleteTarget(null);
  };

  const columns: DataTableColumn<ProductMedia>[] = [
    {
      key: 'preview',
      header: 'Xem trước',
      render: (item) => (
        <button
          type="button"
          onClick={() => setPreviewTarget(item)}
          title="Xem trước media"
          className="group relative block h-16 w-20 overflow-hidden rounded-lg border border-border-default bg-bg-app"
        >
          {item.media_type === 'image' ? (
            <img
              src={item.media_url}
              alt={item.alt_text ?? 'Ảnh sản phẩm'}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-accent-cyan">
              <Film size={24} />
            </span>
          )}
        </button>
      ),
    },
    {
      key: 'product',
      header: 'Sản phẩm',
      render: (item) => {
        const product = getProduct(item.product_id);

        return (
          <div className="min-w-0">
            <p className="max-w-52 truncate font-medium text-text-primary">
              {product?.name ?? `Sản phẩm #${item.product_id}`}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {product?.sku ?? `ID: ${item.product_id}`}
            </p>
          </div>
        );
      },
    },
    {
      key: 'media_url',
      header: 'Thông tin media',
      render: (item) => (
        <div className="min-w-0 max-w-64">
          <p className="truncate text-sm text-text-primary">
            {item.alt_text || 'Chưa có mô tả'}
          </p>
          <a
            href={item.media_url}
            target="_blank"
            rel="noreferrer"
            title={item.media_url}
            className="mt-1 block truncate text-xs text-accent-cyan hover:underline"
          >
            {item.media_url}
          </a>
        </div>
      ),
    },
    {
      key: 'media_type',
      header: 'Loại',
      render: (item) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            item.media_type === 'image'
              ? 'bg-accent-primary/10 text-accent-primary'
              : 'bg-accent-cyan/10 text-accent-cyan'
          }`}
        >
          {item.media_type === 'image' ? (
            <ImageIcon size={13} />
          ) : (
            <Film size={13} />
          )}
          {item.media_type === 'image' ? 'Hình ảnh' : 'Video'}
        </span>
      ),
    },
    {
      key: 'sort_order',
      header: 'Thứ tự',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (item) => (
        <span className="font-medium tabular-nums text-text-primary">
          {item.sort_order}
        </span>
      ),
    },
    {
      key: 'is_primary',
      header: 'Ảnh chính',
      render: (item) =>
        item.is_primary ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-400">
            <Star size={13} fill="currentColor" />
            Ảnh chính
          </span>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSetPrimary(item)}
          >
            <Star size={14} />
            Đặt làm chính
          </Button>
        ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (item) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="icon"
            title="Chỉnh sửa"
            aria-label={`Sửa media ${item.id}`}
            onClick={() => openEditModal(item)}
          >
            <Pencil size={16} />
          </Button>
          <Button
            type="button"
            variant="icon"
            title="Xóa media"
            aria-label={`Xóa media ${item.id}`}
            onClick={() => setDeleteTarget(item)}
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
          title="Hình ảnh & video sản phẩm"
          description="Quản lý thư viện media, ảnh đại diện và thứ tự hiển thị của từng sản phẩm."
          actions={
            <Button type="button" onClick={openCreateModal}>
              <Plus size={18} />
              Thêm media
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <StatCard
              label="Tổng media"
              value={String(stats.total)}
              icon={Images}
              accent="primary"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Tổng ảnh và video đang quản lý
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Hình ảnh"
              value={String(stats.images)}
              icon={ImageIcon}
              accent="cyan"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Hình ảnh dùng trong trang sản phẩm
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Video"
              value={String(stats.videos)}
              icon={Film}
              accent="purple"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Video giới thiệu và hướng dẫn sử dụng
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Media chính"
              value={String(stats.primary)}
              icon={Star}
              accent="warning"
            />
            <p className="px-1 pt-2 text-xs text-text-muted">
              Media đang được chọn làm đại diện
            </p>
          </div>
        </div>

        <section className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
          <div className="flex flex-col gap-3 border-b border-border-default p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <h2 className="font-semibold text-text-primary">
                Danh sách media
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {filteredMedia.length} mục phù hợp với điều kiện tìm kiếm.
              </p>
            </div>

            <div className="min-w-0 xl:w-180">
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
                    placeholder="Tìm sản phẩm, SKU, mô tả..."
                    className="w-full"
                    ariaLabel="Tìm kiếm media sản phẩm"
                  />
                </div>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-text-secondary sm:min-w-36.25">
                  <span>Sản phẩm</span>
                  <select
                    value={productFilter}
                    onChange={(event) => {
                      setProductFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none focus:border-accent-primary"
                  >
                    <option value="all">Tất cả sản phẩm</option>
                    {productMediaProductsMock.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-text-secondary sm:min-w-32">
                  <span>Loại media</span>
                  <select
                    value={typeFilter}
                    onChange={(event) => {
                      setTypeFilter(event.target.value as TypeFilter);
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none focus:border-accent-primary"
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="image">Hình ảnh</option>
                    <option value="video">Video</option>
                  </select>
                </label>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-text-secondary sm:min-w-32">
                  <span>Vai trò</span>
                  <select
                    value={primaryFilter}
                    onChange={(event) => {
                      setPrimaryFilter(
                        event.target.value as PrimaryFilter,
                      );
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none focus:border-accent-primary"
                  >
                    <option value="all">Tất cả media</option>
                    <option value="primary">Media chính</option>
                    <option value="secondary">Media phụ</option>
                  </select>
                </label>
              </FilterBar>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-[11px] text-text-muted sm:px-4">
            <p>
              Hiển thị{' '}
              <span className="font-semibold text-text-secondary">
                {filteredMedia.length === 0
                  ? 0
                  : (safePage - 1) * pageSize + 1}
                –{Math.min(safePage * pageSize, filteredMedia.length)}
              </span>{' '}
              trên{' '}
              <span className="font-semibold text-text-secondary">
                {filteredMedia.length}
              </span>{' '}
              mục media
            </p>

            {hasActiveFilters && (
              <span className="text-accent-primary">
                Đang áp dụng bộ lọc
              </span>
            )}
          </div>

          <div className="min-w-0 overflow-x-auto px-3 pb-3 sm:px-4">
            <div className="min-w-250">
              <DataTable
                columns={columns}
                data={paginatedMedia}
                getRowId={(item) => item.id}
                emptyTitle="Không tìm thấy media"
                emptyDescription="Thử thay đổi từ khóa hoặc bộ lọc, hoặc thêm media mới."
              />
            </div>
          </div>

          <div className="px-3 pb-4 sm:px-4">
            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filteredMedia.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[5, 7, 10, 20]}
            />
          </div>
        </section>

        {/* Modal thêm / chỉnh sửa media */}
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={editingMedia ? 'Chỉnh sửa media' : 'Thêm media sản phẩm'}
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
                    handleProductChange(Number(event.target.value))
                  }
                  className={inputClassName}
                >
                  {productMediaProductsMock.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {product.sku}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>
                  Loại media <span className="text-status-danger">*</span>
                </span>
                <select
                  required
                  value={form.media_type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      media_type: event.target.value as MediaType,
                    }))
                  }
                  className={inputClassName}
                >
                  <option value="image">Hình ảnh</option>
                  <option value="video">Video</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className={labelClassName}>Thứ tự hiển thị</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: Number(event.target.value),
                    }))
                  }
                  className={inputClassName}
                />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className={labelClassName}>
                  Đường dẫn media{' '}
                  <span className="text-status-danger">*</span>
                </span>
                <input
                  required
                  type="url"
                  value={form.media_url}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      media_url: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/product-image.jpg"
                  className={inputClassName}
                />
                <span className="block text-xs text-text-muted">
                  Nhập URL ảnh hoặc video có thể truy cập qua HTTP/HTTPS.
                </span>
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className={labelClassName}>Mô tả ảnh (alt text)</span>
                <input
                  value={form.alt_text}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      alt_text: event.target.value,
                    }))
                  }
                  maxLength={255}
                  placeholder="VD: Nồi chiên không dầu nhìn từ phía trước"
                  className={inputClassName}
                />
                <span className="block text-xs text-text-muted">
                  Dùng để mô tả nội dung ảnh, hỗ trợ khả năng truy cập và SEO.
                </span>
              </label>
            </div>

            {form.media_url.trim() && (
              <div className="overflow-hidden rounded-xl border border-border-default bg-bg-app p-3">
                <p className="mb-2 text-xs font-medium text-text-secondary">
                  Xem trước
                </p>
                {form.media_type === 'image' ? (
                  <img
                    src={form.media_url}
                    alt={form.alt_text || 'Xem trước media'}
                    className="max-h-64 w-full rounded-lg object-contain"
                    onError={() =>
                      setError('Không thể tải ảnh xem trước từ URL này.')
                    }
                  />
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border-default p-4">
                    <Film size={24} className="text-accent-cyan" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        Video sản phẩm
                      </p>
                      <p className="truncate text-xs text-text-muted">
                        {form.media_url}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-default bg-bg-app p-3 transition-colors hover:border-border-strong">
              <input
                type="checkbox"
                checked={form.is_primary}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_primary: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#65D928]"
              />
              <span>
                <span className="block text-sm font-medium text-text-primary">
                  Đặt làm media chính
                </span>
                <span className="mt-1 block text-xs text-text-muted">
                  Media này sẽ thay thế media chính hiện tại của sản phẩm đã chọn.
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
                {editingMedia ? 'Lưu thay đổi' : 'Thêm media'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal xem trước */}
        <Modal
          open={previewTarget !== null}
          onClose={() => setPreviewTarget(null)}
          title="Xem trước media"
          maxWidth="lg"
        >
          {previewTarget && (
            <div className="space-y-4">
              {previewTarget.media_type === 'image' ? (
                <img
                  src={previewTarget.media_url}
                  alt={previewTarget.alt_text ?? 'Ảnh sản phẩm'}
                  className="max-h-[60vh] w-full rounded-lg bg-bg-app object-contain"
                />
              ) : (
                <video
                  src={previewTarget.media_url}
                  controls
                  className="max-h-[60vh] w-full rounded-lg bg-bg-app"
                >
                  Trình duyệt không hỗ trợ phát video.
                </video>
              )}

              <div className="space-y-1 text-sm">
                <p className="font-medium text-text-primary">
                  {getProduct(previewTarget.product_id)?.name ??
                    `Sản phẩm #${previewTarget.product_id}`}
                </p>
                <p className="break-all text-text-secondary">
                  {previewTarget.alt_text || 'Chưa có mô tả'}
                </p>
                <p className="flex items-center gap-2 text-xs text-text-muted">
                  <CalendarDays size={14} />
                  Ngày thêm: {formatDate(previewTarget.created_at)}
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPreviewTarget(null)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <ConfirmDialog
          open={deleteTarget !== null}
          title="Xóa media sản phẩm?"
          description={
            deleteTarget
              ? `Bạn có chắc muốn xóa media #${deleteTarget.id} của sản phẩm "${
                  getProduct(deleteTarget.product_id)?.name ??
                  `#${deleteTarget.product_id}`
                }"? Thao tác này chỉ cập nhật mock data trong giao diện hiện tại.`
              : ''
          }
          confirmText="Xóa media"
          cancelText="Hủy"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  );
}
