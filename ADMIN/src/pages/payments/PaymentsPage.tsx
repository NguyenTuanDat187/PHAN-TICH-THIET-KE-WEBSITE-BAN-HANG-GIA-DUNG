
import { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  RotateCcw,
  XCircle,
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import SearchBar from '../../components/shared/SearchBar';
import FilterBar from '../../components/shared/FilterBar';
import DataTable  from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { paymentsMock } from '../../mocks/payments.mock';
import { ordersMock } from '../../mocks/orders.mock';
import Pagination from '../../components/shared/Pagination';

import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../../types/payment.types';

const PAGE_SIZE = 8;

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK: 'Chuyển khoản',
  MOMO: 'MoMo',
  VNPAY: 'VNPay',
  ZALOPAY: 'ZaloPay',
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Chờ thanh toán',
  processing: 'Đang xử lý',
  paid: 'Thành công',
  failed: 'Thất bại',
  refunded: 'Đã hoàn tiền',
};

const PAYMENT_STATUS_VARIANTS: Record<
  PaymentStatus,
  'success' | 'warning' | 'danger' | 'info' | 'purple' | 'neutral'
> = {
  pending: 'warning',
  processing: 'info',
  paid: 'success',
  failed: 'danger',
  refunded: 'purple',
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

function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

function formatDate(date: string | null): string {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '—';

  return DATE_FORMATTER.format(parsedDate);
}

function getOrderNumber(orderId: number): string {
  const order = ordersMock.find((item) => item.id === orderId);

  return order?.order_number ?? `#${orderId}`;
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>(
    'all',
  );
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>(
    'all',
  );
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const payments = paymentsMock;

    return {
      total: payments.length,
      paidAmount: payments.reduce(
        (sum, payment) =>
          payment.status === 'paid' ? sum + payment.amount : sum,
        0,
      ),
      pending: payments.filter(
        (payment) =>
          payment.status === 'pending' ||
          payment.status === 'processing',
      ).length,
      failed: payments.filter((payment) => payment.status === 'failed').length,
      refunded: payments.filter(
        (payment) => payment.status === 'refunded',
      ).length,
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return paymentsMock
      .filter((payment) => {
        const orderNumber = getOrderNumber(payment.order_id).toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          payment.transaction_code
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          orderNumber.includes(normalizedSearch) ||
          String(payment.order_id).includes(normalizedSearch);

        const matchesStatus =
          statusFilter === 'all' || payment.status === statusFilter;

        const matchesMethod =
          methodFilter === 'all' ||
          payment.payment_method === methodFilter;

        return Boolean(matchesSearch) && matchesStatus && matchesMethod;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }, [search, statusFilter, methodFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE),
  );

  const safePage = Math.min(page, totalPages);

  const paginatedPayments = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;

    return filteredPayments.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPayments, safePage]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setMethodFilter('all');
    setPage(1);
  };

  const columns = [
    {
      key: 'transaction',
      header: 'Giao dịch',
      render: (payment: Payment) => (
        <div className="min-w-0">
          <p className="font-medium text-text-primary">
            {payment.transaction_code || 'Chưa có mã giao dịch'}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Tạo lúc {formatDate(payment.created_at)}
          </p>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Đơn hàng',
      render: (payment: Payment) => (
        <span className="font-medium text-accent-primary">
          {getOrderNumber(payment.order_id)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Phương thức',
      render: (payment: Payment) => (
        <div className="flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-elevated">
            {payment.payment_method === 'COD' ? (
              <Banknote size={16} className="text-text-secondary" />
            ) : (
              <CreditCard size={16} className="text-text-secondary" />
            )}
          </span>
          <span className="text-sm text-text-secondary">
            {PAYMENT_METHOD_LABELS[payment.payment_method]}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Số tiền',
      render: (payment: Payment) => (
        <span className="whitespace-nowrap font-semibold tabular-nums text-text-primary">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (payment: Payment) => (
        <StatusBadge
          status={PAYMENT_STATUS_LABELS[payment.status]}
          variant={PAYMENT_STATUS_VARIANTS[payment.status]}
        />
      ),
    },
    {
      key: 'paid_at',
      header: 'Thanh toán lúc',
      render: (payment: Payment) => (
        <span className="whitespace-nowrap text-sm text-text-secondary">
          {formatDate(payment.paid_at)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thanh toán"
        description="Theo dõi giao dịch, phương thức thanh toán và trạng thái thu tiền của các đơn hàng."
        eyebrow="TÀI CHÍNH"
      />

      <section
        aria-label="Tổng quan thanh toán"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Tổng giao dịch"
          value={stats.total.toLocaleString('vi-VN')}
          icon={CreditCard}
          accent="primary"
        />

        <StatCard
          label="Tổng tiền thành công"
          value={formatCurrency(stats.paidAmount)}
          icon={CheckCircle2}
          accent="primary"
        />

        <StatCard
          label="Chờ xử lý"
          value={stats.pending.toLocaleString('vi-VN')}
          icon={Clock3}
          accent="warning"
        />

        <StatCard
          label="Giao dịch thất bại"
          value={stats.failed.toLocaleString('vi-VN')}
          icon={XCircle}
          accent="purple"
        />
      </section>

      <section className="overflow-hidden rounded-card border border-border-default bg-bg-surface">
        <div className="flex flex-col gap-4 border-b border-border-default p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Danh sách giao dịch
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Tra cứu và lọc các giao dịch thanh toán trong hệ thống.
              </p>
            </div>

            <span className="text-sm text-text-secondary">
              {filteredPayments.length} giao dịch
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="w-full lg:max-w-sm">
              <SearchBar
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                placeholder="Tìm mã giao dịch hoặc mã đơn..."
                ariaLabel="Tìm kiếm giao dịch thanh toán"
              />
            </div>

            <FilterBar
              onReset={resetFilters}
              showReset={search !== '' || statusFilter !== 'all' || methodFilter !== 'all'}
              resetLabel="Xóa bộ lọc"
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as PaymentStatus | 'all',
                  );
                  setPage(1);
                }}
                aria-label="Lọc theo trạng thái thanh toán"
                className="h-11 w-full rounded-btn border border-border-default bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary sm:w-auto"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="processing">Đang xử lý</option>
                <option value="paid">Thành công</option>
                <option value="failed">Thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>

              <select
                value={methodFilter}
                onChange={(event) => {
                  setMethodFilter(
                    event.target.value as PaymentMethod | 'all',
                  );
                  setPage(1);
                }}
                aria-label="Lọc theo phương thức thanh toán"
                className="h-11 w-full rounded-btn border border-border-default bg-bg-elevated px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary sm:w-auto"
              >
                <option value="all">Tất cả phương thức</option>
                <option value="COD">Thanh toán khi nhận hàng</option>
                <option value="BANK">Chuyển khoản</option>
                <option value="MOMO">MoMo</option>
                <option value="VNPAY">VNPay</option>
                <option value="ZALOPAY">ZaloPay</option>
              </select>
            </FilterBar>
          </div>
        </div>

        <DataTable<Payment>
          columns={columns}
          data={paginatedPayments}
          getRowId={(payment) => payment.id}
          emptyTitle="Không tìm thấy giao dịch"
          emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem kết quả khác."
        />

        <div className="flex flex-col gap-3 border-t border-border-default px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-sm text-text-muted">
            {filteredPayments.length === 0
              ? 'Không có dữ liệu'
              : `Hiển thị ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                  safePage * PAGE_SIZE,
                  filteredPayments.length,
                )} trong ${filteredPayments.length} giao dịch`}
          </p>

          <Pagination
            page={safePage}
            pageSize={PAGE_SIZE}
            total={filteredPayments.length}
            onPageChange={setPage}
          />
        </div>
      </section>

      {stats.refunded > 0 && (
        <div className="flex items-start gap-3 rounded-card border border-border-default bg-bg-surface p-4">
          <RotateCcw
            size={18}
            className="mt-0.5 shrink-0 text-text-secondary"
          />
          <div>
            <p className="text-sm font-medium text-text-primary">
              {stats.refunded} giao dịch đã hoàn tiền
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Kiểm tra chi tiết giao dịch trước khi xử lý các yêu cầu hoàn tiền
              thực tế.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
