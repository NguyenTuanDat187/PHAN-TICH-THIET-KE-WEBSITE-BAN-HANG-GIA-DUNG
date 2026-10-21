
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  Save,
  ShoppingBag,
  Truck,
  UserRound,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '../../components/ui/buttons/Button';
import StatusBadge from '../../components/shared/StatusBadge';

import { ordersMock } from '../../mocks/orders.mock';
import { orderItemsMock } from '../../mocks/order-items.mock';

import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from '../../types/order.types';
import type { OrderItem } from '../../types/order-item.types';

/* =========================================================
   CONSTANTS
========================================================= */

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'neutral';

interface StatusOption {
  value: OrderStatus;
  label: string;
  variant: BadgeVariant;
}

const ORDER_STATUS_OPTIONS: StatusOption[] = [
  { value: 'pending', label: 'Chờ xác nhận', variant: 'warning' },
  { value: 'confirmed', label: 'Đã xác nhận', variant: 'info' },
  { value: 'processing', label: 'Đang xử lý', variant: 'purple' },
  { value: 'shipping', label: 'Đang giao hàng', variant: 'info' },
  { value: 'completed', label: 'Hoàn thành', variant: 'success' },
  { value: 'cancelled', label: 'Đã hủy', variant: 'danger' },
  { value: 'returned', label: 'Đã trả hàng', variant: 'neutral' },
];

const PAYMENT_STATUS_MAP: Record<
  PaymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: 'Chưa thanh toán', variant: 'warning' },
  paid: { label: 'Đã thanh toán', variant: 'success' },
  failed: { label: 'Thanh toán thất bại', variant: 'danger' },
  refunded: { label: 'Đã hoàn tiền', variant: 'purple' },
};

const PAYMENT_METHOD_MAP: Record<Order['payment_method'], string> = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  BANK: 'Chuyển khoản ngân hàng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay',
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const DATE_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const formatCurrency = (value: number) =>
  CURRENCY_FORMATTER.format(value);

const formatDate = (value: string | null | undefined): string => {
  if (!value) return 'Chưa cập nhật';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : DATE_FORMATTER.format(date);
};

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-card border border-border-default bg-bg-surface p-4 sm:p-5 ${className}`}
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-accent-primary">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-text-primary">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-5 text-text-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = '',
}: {
  label: string;
  value?: string | null;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-sm text-text-muted">{label}</span>
      <span
        className={`wrap-break-word text-sm font-medium text-text-primary sm:max-w-[65%] sm:text-right ${valueClassName}`}
      >
        {value || 'Chưa cập nhật'}
      </span>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  valueClassName = '',
}: {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 rounded-card border border-border-default bg-bg-surface p-4">
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Icon size={16} className="shrink-0" />
        <span>{title}</span>
      </div>

      <p
        className={`mt-3 wrap-break-word text-xl font-bold text-text-primary sm:text-2xl ${valueClassName}`}
      >
        {value}
      </p>

      {description && (
        <p className="mt-2 wrap-break-word text-xs leading-5 text-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   ORDER ITEMS
========================================================= */

function OrderItemsSection({ items }: { items: OrderItem[] }) {
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // unit_price là đơn giá; discount_amount và total_price
  // được hiểu là tổng tiền giảm và thành tiền của từng dòng.
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  const totalDiscount = items.reduce(
    (sum, item) => sum + item.discount_amount,
    0,
  );

  const totalAfterDiscount = items.reduce(
    (sum, item) => sum + item.total_price,
    0,
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-card border border-border-default bg-bg-surface">
      <div className="flex flex-col gap-3 border-b border-border-default p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-accent-primary">
            <ShoppingBag size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-text-primary">
              Sản phẩm trong đơn hàng
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Sản phẩm, phân loại và giá trị từng dòng
            </p>
          </div>
        </div>

        <span className="w-fit rounded-lg bg-bg-elevated px-3 py-2 text-sm text-text-secondary">
          {items.length} dòng · {totalQuantity} sản phẩm
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-10 text-center">
          <ShoppingBag size={30} className="mb-3 text-text-muted" />
          <p className="font-medium text-text-primary">
            Chưa có sản phẩm trong đơn
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Kiểm tra order_id trong order-items.mock.ts.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-175 text-sm">
              <thead className="bg-bg-app text-text-muted">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">
                    Sản phẩm
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    SL
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Đơn giá
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Giảm giá
                  </th>
                  <th className="px-5 py-3 text-right font-medium">
                    Thành tiền
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-default">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-bg-hover/50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-55 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-app text-accent-primary">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="wrap-break-word font-medium text-text-primary">
                            {item.product_name}
                          </p>

                          {item.product_sku && (
                            <p className="mt-1 text-xs text-text-muted">
                              SKU: {item.product_sku}
                            </p>
                          )}

                          {item.variant_sku && (
                            <p className="mt-1 text-xs text-text-muted">
                              SKU biến thể: {item.variant_sku}
                            </p>
                          )}

                          {item.variant_attributes && (
                            <p className="mt-1 wrap-break-word text-xs leading-5 text-text-secondary">
                              {item.variant_attributes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-center text-text-primary">
                      {item.quantity}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-right text-text-secondary">
                      {formatCurrency(item.unit_price)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-right">
                      {item.discount_amount > 0 ? (
                        <span className="text-status-success">
                          −{formatCurrency(item.discount_amount)}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-text-primary">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile layout */}
          <div className="divide-y divide-border-default md:hidden">
            {items.map((item) => (
              <article key={item.id} className="space-y-4 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-app text-accent-primary">
                    <Package size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="wrap-break-word font-medium text-text-primary">
                      {item.product_name}
                    </p>

                    {item.product_sku && (
                      <p className="mt-1 text-xs text-text-muted">
                        SKU: {item.product_sku}
                      </p>
                    )}

                    {item.variant_sku && (
                      <p className="mt-1 text-xs text-text-muted">
                        SKU biến thể: {item.variant_sku}
                      </p>
                    )}

                    {item.variant_attributes && (
                      <p className="mt-1 wrap-break-word text-xs leading-5 text-text-secondary">
                        {item.variant_attributes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-text-muted">Đơn giá</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">Số lượng</p>
                    <p className="mt-1 text-sm text-text-primary">
                      {item.quantity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">Giảm giá</p>
                    <p className="mt-1 text-sm text-status-success">
                      {item.discount_amount > 0
                        ? `−${formatCurrency(item.discount_amount)}`
                        : '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">Thành tiền</p>
                    <p className="mt-1 wrap-break-word text-sm font-semibold text-text-primary">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Product totals */}
          <div className="border-t border-border-default bg-bg-app p-4 sm:p-5">
            <div className="ml-auto max-w-sm space-y-3">
              <InfoRow
                label="Tiền hàng trước giảm giá"
                value={formatCurrency(subtotal)}
              />

              <InfoRow
                label="Giảm giá sản phẩm"
                value={`−${formatCurrency(totalDiscount)}`}
                valueClassName="text-status-success"
              />

              <div className="flex items-start justify-between gap-4 border-t border-border-default pt-3">
                <span className="text-sm font-semibold text-text-primary">
                  Thành tiền sản phẩm
                </span>
                <span className="text-right text-lg font-bold text-accent-primary">
                  {formatCurrency(totalAfterDiscount)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

/* =========================================================
   ORDER DETAIL PAGE
========================================================= */

export default function OrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const orderId = Number(id);

  const order = Number.isInteger(orderId)
    ? ordersMock.find((item) => item.id === orderId)
    : undefined;

  const orderItems = order
    ? orderItemsMock.filter((item) => item.order_id === order.id)
    : [];

  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>('pending');

  const [savedStatus, setSavedStatus] =
    useState<OrderStatus>('pending');

  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const initialStatus = order?.status ?? 'pending';

    setSelectedStatus(initialStatus);
    setSavedStatus(initialStatus);
    setSaveMessage('');
  }, [order]);

  if (!order) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-bg-elevated text-text-muted">
          <Package size={26} />
        </div>

        <h1 className="text-lg font-semibold text-text-primary">
          Không tìm thấy đơn hàng
        </h1>

        <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
          Đơn hàng không tồn tại hoặc chưa có trong dữ liệu mock.
        </p>

        <Button
          className="mt-5"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const currentStatus =
    ORDER_STATUS_OPTIONS.find(
      (option) => option.value === savedStatus,
    ) ?? ORDER_STATUS_OPTIONS[0];

  const selectedStatusOption =
    ORDER_STATUS_OPTIONS.find(
      (option) => option.value === selectedStatus,
    ) ?? ORDER_STATUS_OPTIONS[0];

  const paymentStatus = PAYMENT_STATUS_MAP[order.payment_status];

  const fullAddress = [
    order.shipping_address,
    order.shipping_ward,
    order.shipping_district,
    order.shipping_province,
  ]
    .filter(Boolean)
    .join(', ');

  const timeline = [
    { label: 'Đặt hàng', date: order.created_at },
    { label: 'Xác nhận đơn', date: order.confirmed_at },
    { label: 'Bắt đầu giao hàng', date: order.shipped_at },
    { label: 'Hoàn thành đơn', date: order.completed_at },
    { label: 'Hủy đơn', date: order.cancelled_at },
  ].filter(
    (item): item is { label: string; date: string } =>
      Boolean(item.date),
  );

  const hasUnsavedChanges = selectedStatus !== savedStatus;

  const handleSaveStatus = () => {
    // FE-only: cập nhật trạng thái hiển thị trong trang hiện tại.
    // Sau này thay phần này bằng API và logic nghiệp vụ.
    setSavedStatus(selectedStatus);
    setSaveMessage('Đã cập nhật trạng thái trên giao diện.');
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-8">
      {/* Page header */}
      <header className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent-primary"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách đơn hàng
        </button>

        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-all text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {order.order_number}
              </h1>

              <StatusBadge
                status={currentStatus.label}
                variant={currentStatus.variant}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={15} />
                Đặt lúc {formatDate(order.created_at)}
              </span>

              <span className="inline-flex items-center gap-2">
                <Package size={15} />
                ID đơn hàng: #{order.id}
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} className="mr-2" />
            In đơn hàng
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Tổng thanh toán"
            value={formatCurrency(order.total_amount)}
            description="Tổng giá trị đơn hàng"
            icon={Wallet}
            valueClassName="text-accent-primary"
          />

          <SummaryCard
            title="Khách hàng"
            value={order.customer_name}
            description={order.customer_phone}
            icon={UserRound}
          />

          <div className="min-w-0 rounded-card border border-border-default bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Truck size={16} />
              Trạng thái đơn
            </div>

            <div className="mt-4">
              <StatusBadge
                status={currentStatus.label}
                variant={currentStatus.variant}
              />
            </div>

            <p className="mt-3 text-xs leading-5 text-text-muted">
              Trạng thái hiện tại của đơn hàng
            </p>
          </div>

          <div className="min-w-0 rounded-card border border-border-default bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <CreditCard size={16} />
              Thanh toán
            </div>

            <div className="mt-4">
              <StatusBadge
                status={paymentStatus.label}
                variant={paymentStatus.variant}
              />
            </div>

            <p className="mt-3 wrap-break-word text-xs leading-5 text-text-muted">
              {PAYMENT_METHOD_MAP[order.payment_method]}
            </p>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <div className="min-w-0 space-y-5">
          {/* Customer */}
          <SectionCard
            title="Thông tin khách hàng"
            description="Thông tin liên hệ của người đặt hàng"
            icon={UserRound}
          >
            <div className="mb-5 flex flex-col gap-4 rounded-xl border border-border-default bg-bg-app p-4 sm:flex-row sm:items-center">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-lg font-bold text-accent-primary">
                {order.customer_name.trim().charAt(0).toUpperCase() || '?'}
              </div>

              <div className="min-w-0 flex-1">
                <p className="wrap-break-word font-semibold text-text-primary">
                  {order.customer_name}
                </p>

                <p className="mt-1 wrap-break-word text-xs text-text-muted">
                  {order.user_id != null
                    ? `Mã khách hàng: ${order.user_id}`
                    : 'Khách chưa liên kết tài khoản'}
                </p>
              </div>

              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-btn border border-border-default px-3 text-sm text-text-secondary transition-colors hover:border-accent-primary hover:text-accent-primary"
                >
                  <Phone size={15} />
                  Gọi khách
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="flex min-w-0 items-start gap-3">
                <Phone size={17} className="mt-0.5 shrink-0 text-text-muted" />

                <div className="min-w-0">
                  <p className="text-xs text-text-muted">Số điện thoại</p>
                  <p className="mt-1 break-all text-sm font-medium text-text-primary">
                    {order.customer_phone || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-start gap-3">
                <Mail size={17} className="mt-0.5 shrink-0 text-text-muted" />

                <div className="min-w-0">
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="mt-1 break-all text-sm font-medium text-text-primary">
                    {order.customer_email || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Shipping address */}
          <SectionCard
            title="Địa chỉ nhận hàng"
            description="Địa chỉ khách cung cấp khi đặt hàng"
            icon={MapPin}
          >
            <div className="rounded-xl border border-border-default bg-bg-app p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
                <MapPin size={17} className="text-accent-primary" />
                Địa chỉ giao hàng
              </div>

              <p className="wrap-break-word text-sm leading-6 text-text-secondary">
                {fullAddress || 'Chưa có thông tin địa chỉ giao hàng.'}
              </p>

              <div className="mt-4 space-y-3 border-t border-border-default pt-4">
                <InfoRow
                  label="Người nhận"
                  value={order.customer_name}
                />

                <InfoRow
                  label="Số điện thoại"
                  value={order.customer_phone}
                />
              </div>
            </div>
          </SectionCard>

          {/* Products */}
          <OrderItemsSection items={orderItems} />

          {/* Order note */}
          <SectionCard
            title="Ghi chú đơn hàng"
            description="Yêu cầu hoặc thông tin bổ sung"
            icon={FileText}
          >
            {order.note ? (
              <p className="whitespace-pre-wrap wrap-break-word rounded-xl border border-border-default bg-bg-app p-4 text-sm leading-6 text-text-secondary">
                {order.note}
              </p>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border-strong p-4 text-sm text-text-muted">
                <FileText size={18} />
                Đơn hàng chưa có ghi chú.
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-5">
          {/* Status editor */}
          <SectionCard
            title="Cập nhật trạng thái"
            description="Chọn trạng thái đơn hàng"
            icon={Truck}
          >
            <label
              htmlFor="order-status"
              className="mb-2 block text-sm font-medium text-text-secondary"
            >
              Trạng thái đơn hàng
            </label>

            <select
              id="order-status"
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(event.target.value as OrderStatus);
                setSaveMessage('');
              }}
              className="h-11 w-full rounded-btn border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="mt-4 rounded-xl border border-border-default bg-bg-app p-3">
              <p className="mb-2 text-xs text-text-muted">
                Trạng thái đang chọn
              </p>

              <StatusBadge
                status={selectedStatusOption.label}
                variant={selectedStatusOption.variant}
              />
            </div>

            {hasUnsavedChanges && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-status-warning/10 p-3 text-xs leading-5 text-status-warning">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                Bạn có thay đổi chưa lưu.
              </div>
            )}

            {saveMessage && (
              <p
                role="status"
                className="mt-3 flex items-start gap-2 text-xs leading-5 text-status-success"
              >
                <Check size={15} className="mt-0.5 shrink-0" />
                {saveMessage}
              </p>
            )}

            <Button
              className="mt-4 w-full"
              disabled={!hasUnsavedChanges}
              onClick={handleSaveStatus}
            >
              <Save size={16} className="mr-2" />
              Lưu trạng thái
            </Button>

            <p className="mt-3 text-xs leading-5 text-text-muted">
              Hiện chỉ cập nhật giao diện trong phiên đang mở. Chưa ghi vào
              mock hoặc database.
            </p>
          </SectionCard>

          {/* Payment breakdown */}
          <SectionCard
            title="Tổng kết thanh toán"
            description="Chi tiết các khoản tiền của đơn hàng"
            icon={CreditCard}
          >
            <div className="space-y-4">
              <InfoRow
                label="Tiền hàng"
                value={formatCurrency(order.subtotal)}
              />

              <InfoRow
                label="Giảm giá đơn hàng"
                value={`−${formatCurrency(order.discount_amount)}`}
                valueClassName="text-status-success"
              />

              <InfoRow
                label="Phí vận chuyển"
                value={formatCurrency(order.shipping_fee)}
              />

              <InfoRow
                label="Thuế"
                value={formatCurrency(order.tax_amount)}
              />

              <div className="border-t border-border-default pt-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-text-primary">
                    Tổng thanh toán
                  </span>

                  <span className="wrap-break-word text-right text-xl font-bold text-accent-primary">
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border-default bg-bg-app p-3">
              <p className="mb-2 text-xs text-text-muted">
                Phương thức thanh toán
              </p>

              <p className="wrap-break-word text-sm font-medium text-text-primary">
                {PAYMENT_METHOD_MAP[order.payment_method]}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-text-muted">
                  Trạng thái thanh toán
                </span>

                <StatusBadge
                  status={paymentStatus.label}
                  variant={paymentStatus.variant}
                />
              </div>
            </div>
          </SectionCard>

          {/* Timeline */}
          <SectionCard
            title="Lịch sử đơn hàng"
            description="Các mốc thời gian có dữ liệu"
            icon={Clock3}
          >
            {timeline.length > 0 ? (
              <div>
                {timeline.map((item, index) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-default bg-bg-app">
                        <span className="size-2 rounded-full bg-accent-primary" />
                      </div>

                      {index < timeline.length - 1 && (
                        <div className="my-1 min-h-7 w-px flex-1 bg-border-default" />
                      )}
                    </div>

                    <div className="min-w-0 pb-5">
                      <p className="text-sm font-medium text-text-primary">
                        {item.label}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Chưa có lịch sử đơn hàng.
              </p>
            )}
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
