import {
  ArrowLeft,
  CalendarDays,
  Package,
  Pencil,
  Tag,
  Warehouse,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import { Button } from '../../components/ui/buttons/Button';
import { getProducts } from '../../mocks/products.mock';
import type { Product, ProductStatus } from '../../types/product.types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const statusLabel: Record<ProductStatus, string> = {
  active: 'Đang bán',
  inactive: 'Ngừng bán',
  draft: 'Bản nháp',
};

const statusVariant: Record<
  ProductStatus,
  'success' | 'neutral' | 'warning'
> = {
  active: 'success',
  inactive: 'neutral',
  draft: 'warning',
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-center rounded-xl border border-border-default bg-bg-elevated/40 p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm font-semibold leading-6 text-text-primary">
        {value || 'Chưa cập nhật'}
      </p>
    </div>
  );
}

function ManagementItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-elevated text-text-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="mt-1 wrap-break-word text-sm font-medium leading-6 text-text-primary">
          {value || 'Chưa cập nhật'}
        </p>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const found = getProducts().find((item) => item.id === id);

    if (!found) {
      navigate('/products', { replace: true });
      return;
    }

    setProduct(found);
    setImageError(false);
  }, [id, navigate]);

  if (!product) {
    return (
      <main className="mx-auto w-full min-w-0 max-w-[1600px] p-4 sm:p-5 xl:p-6">
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-border-default bg-bg-surface text-sm text-text-secondary">
          Đang tải thông tin sản phẩm...
        </div>
      </main>
    );
  }

  const discount =
    product.originalPrice > product.price && product.originalPrice > 0
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  return (
    <main className="mx-auto w-full min-w-0 max-w-[1800px] space-y-6 p-4 pb-8 sm:space-y-7 sm:p-5 sm:pb-8 xl:p-6 xl:pb-10">
      <PageHeader
        title="Chi tiết sản phẩm"
        description="Xem thông tin, giá bán và tình trạng kinh doanh của sản phẩm."
        eyebrow={`PRODUCT / ${product.sku}`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link to="/products" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Link
              to={`/products/${product.id}/edit`}
              className="w-full sm:w-auto"
            >
              <Button variant="primary" className="w-full sm:w-auto">
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid min-w-0 grid-cols-1 items-start gap-5 lg:gap-6 2xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
          <div className="border-b border-border-default px-5 py-4 sm:px-6">
            <p className="text-sm font-semibold text-text-primary">
              Hình ảnh sản phẩm
            </p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Hình ảnh minh họa của mặt hàng đang quản lý
            </p>
          </div>

          <div className="flex min-h-70 items-center justify-center bg-bg-elevated/50 p-6 sm:min-h-90 sm:p-8 xl:min-h-105">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                onError={() => setImageError(true)}
                className="max-h-105 w-full object-contain"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-border-default bg-bg-surface">
                <Package className="h-14 w-14 text-text-muted" />
              </div>
            )}
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge
                status={statusLabel[product.status]}
                variant={statusVariant[product.status]}
              />
              <span className="rounded-lg border border-border-default bg-bg-elevated px-3 py-1.5 text-xs font-medium text-text-secondary">
                SKU: {product.sku}
              </span>
            </div>

            <div>
              <h2 className="wrap-break-word text-xl font-bold leading-8 text-text-primary sm:text-2xl">
                {product.name}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-text-secondary">
                {product.description || 'Chưa có mô tả cho sản phẩm này.'}
              </p>
            </div>
          </div>
        </section>

        <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6">
          <section className="min-w-0 rounded-2xl border border-border-default bg-bg-surface p-5 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
                <Tag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-text-primary">
                  Thông tin giá bán
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-muted">
                  Giá hiện tại và thông tin phân loại sản phẩm
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border-default bg-bg-elevated/40 p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Giá bán hiện tại
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="wrap-break-word text-2xl font-bold leading-tight text-accent-primary sm:text-3xl">
                  {formatCurrency(product.price)}
                </span>

                {discount > 0 && (
                  <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                    Giảm {discount}%
                  </span>
                )}
              </div>

              {product.originalPrice > product.price && (
                <p className="mt-2 text-sm text-text-muted">
                  Giá gốc:{' '}
                  <span className="line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                </p>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="Thương hiệu" value={product.brand} />
              <DetailItem label="Danh mục" value={product.category} />
            </div>
          </section>

          <section className="min-w-0 rounded-2xl border border-border-default bg-bg-surface p-5 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Warehouse className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-text-primary">
                  Tình trạng kho
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-muted">
                  Theo dõi số lượng hàng hiện có
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-border-default bg-bg-elevated/40 p-4 sm:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
                <Package className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-sm text-text-secondary">Số lượng tồn kho</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {product.stock}
                  <span className="ml-2 text-sm font-normal text-text-muted">
                    sản phẩm
                  </span>
                </p>
              </div>

              <div className="sm:ml-auto">
                {product.stock <= 0 ? (
                  <StatusBadge status="Hết hàng" variant="danger" />
                ) : product.stock <= 10 ? (
                  <StatusBadge status="Sắp hết hàng" variant="warning" />
                ) : (
                  <StatusBadge status="Còn hàng" variant="success" />
                )}
              </div>
            </div>

            {product.stock <= 0 && (
              <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm leading-6 text-red-400">
                Sản phẩm hiện đã hết hàng. Cần kiểm tra kế hoạch nhập bổ sung.
              </p>
            )}

            {product.stock > 0 && product.stock <= 10 && (
              <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm leading-6 text-amber-400">
                Sản phẩm sắp hết hàng. Nên kiểm tra và lên kế hoạch nhập bổ sung.
              </p>
            )}
          </section>

          <section className="min-w-0 rounded-2xl border border-border-default bg-bg-surface p-5 sm:p-6 lg:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-text-primary">
                  Thông tin quản lý
                </h2>
                <p className="mt-1 text-sm leading-5 text-text-muted">
                  Mã định danh và lịch sử cập nhật
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <ManagementItem
                icon={Tag}
                label="Mã sản phẩm"
                value={product.id}
              />
              <ManagementItem
                icon={CalendarDays}
                label="Ngày tạo"
                value={product.createdAt}
              />
              <ManagementItem
                icon={CalendarDays}
                label="Cập nhật lần cuối"
                value={product.updatedAt}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}