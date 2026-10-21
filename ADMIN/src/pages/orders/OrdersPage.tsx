
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Eye,
    Search,
    RotateCcw,
    ShoppingCart,
    Clock3,
    Truck,
    Banknote,
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import DataTable, {
    type DataTableColumn,
} from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import Pagination from '../../components/shared/Pagination';
import { Button } from '../../components/ui/buttons/Button';

import { ordersMock } from '../../mocks/orders.mock';
import type {
    Order,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
} from '../../types/order.types';

const PAGE_SIZE = 7;

type BadgeVariant =
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'purple'
    | 'neutral';

const orderStatusLabels: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    returned: 'Đã trả hàng',
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
    pending: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thanh toán thất bại',
    refunded: 'Đã hoàn tiền',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
    COD: 'COD',
    BANK: 'Chuyển khoản',
    MOMO: 'MoMo',
    VNPAY: 'VNPay',
    ZALOPAY: 'ZaloPay',
};

const orderStatusVariants: Record<OrderStatus, BadgeVariant> = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipping: 'info',
    completed: 'success',
    cancelled: 'danger',
    returned: 'purple',
};

const paymentStatusVariants: Record<PaymentStatus, BadgeVariant> = {
    pending: 'warning',
    paid: 'success',
    failed: 'danger',
    refunded: 'purple',
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export default function OrdersPage() {
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        OrderStatus | 'all'
    >('all');
    const [paymentFilter, setPaymentFilter] = useState<
        PaymentStatus | 'all'
    >('all');
    const [methodFilter, setMethodFilter] = useState<
        PaymentMethod | 'all'
    >('all');
    const [page, setPage] = useState(1);

    const filteredOrders = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return ordersMock.filter((order) => {
            const matchesSearch =
                !keyword ||
                order.order_number.toLowerCase().includes(keyword) ||
                order.customer_name.toLowerCase().includes(keyword) ||
                order.customer_phone.includes(keyword) ||
                order.customer_email.toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === 'all' ||
                order.status === statusFilter;

            const matchesPayment =
                paymentFilter === 'all' ||
                order.payment_status === paymentFilter;

            const matchesMethod =
                methodFilter === 'all' ||
                order.payment_method === methodFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment &&
                matchesMethod
            );
        });
    }, [search, statusFilter, paymentFilter, methodFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / PAGE_SIZE),
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );

    const pendingCount = ordersMock.filter(
        (order) => order.status === 'pending',
    ).length;

    const shippingCount = ordersMock.filter(
        (order) => order.status === 'shipping',
    ).length;

    const totalRevenue = ordersMock
        .filter((order) => order.status === 'completed')
        .reduce((sum, order) => sum + order.total_amount, 0);

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setPaymentFilter('all');
        setMethodFilter('all');
        setPage(1);
    };

    const columns: DataTableColumn<Order>[] = [
        {
            key: 'order',
            header: 'Đơn hàng',
            className: 'min-w-[180px]',
            render: (order) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-text-primary">
                        {order.order_number}
                    </span>
                    <span className="text-xs text-text-muted">
                        {formatDate(order.created_at)}
                    </span>
                </div>
            ),
        },
        {
            key: 'customer',
            header: 'Khách hàng',
            className: 'min-w-[190px]',
            render: (order) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-text-primary">
                        {order.customer_name}
                    </span>
                    <span className="text-xs text-text-secondary">
                        {order.customer_phone}
                    </span>
                    <span className="max-w-55 truncate text-xs text-text-muted">
                        {order.customer_email}
                    </span>
                </div>
            ),
        },
        {
            key: 'total',
            header: 'Tổng thanh toán',
            className: 'min-w-[155px]',
            render: (order) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-text-primary">
                        {formatCurrency(order.total_amount)}
                    </span>

                    {order.discount_amount > 0 && (
                        <span className="text-xs text-text-muted">
                            Giảm {formatCurrency(order.discount_amount)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'payment',
            header: 'Thanh toán',
            className: 'min-w-[170px]',
            render: (order) => (
                <div className="flex flex-col items-start gap-2">
                    <span className="text-sm text-text-primary">
                        {paymentMethodLabels[order.payment_method]}
                    </span>

                    <StatusBadge
                        status={paymentStatusLabels[order.payment_status]}
                        variant={paymentStatusVariants[order.payment_status]}
                    />
                </div>
            ),
        },
        {
            key: 'status',
            header: 'Trạng thái đơn',
            className: 'min-w-[155px]',
            render: (order) => (
                <StatusBadge
                    status={orderStatusLabels[order.status]}
                    variant={orderStatusVariants[order.status]}
                />
            ),
        },
        {
            key: 'actions',
            header: 'Thao tác',
            className: 'min-w-[90px]',
            headerClassName: 'text-right',
            render: (order) => (
                <div className="flex justify-end">
                  <Button
  type="button"
  variant="ghost"
  aria-label={`Xem đơn ${order.order_number}`}
  onClick={() => navigate(`/orders/${order.id}`)}
>
  <Eye size={17} />
</Button>
                </div>
            ),
        },
    ];

    return (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 xl:p-8">
            <PageHeader
                title="Quản lý đơn hàng"
                description="Theo dõi đơn hàng, trạng thái xử lý và tình hình thanh toán."
            />

            {/* Thống kê tổng quan */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Tổng đơn hàng"
                    value={String(ordersMock.length)}
                    icon={ShoppingCart}
                    accent="primary"
                />

                <StatCard
                    label="Chờ xác nhận"
                    value={String(pendingCount)}
                    icon={Clock3}
                    accent="warning"
                />

                <StatCard
                    label="Đang giao"
                    value={String(shippingCount)}
                    icon={Truck}
                    accent="cyan"
                />

                <StatCard
                    label="Doanh thu hoàn thành"
                    value={formatCurrency(totalRevenue)}
                    icon={Banknote}
                    accent="purple"
                />
            </section>

            {/* Bộ lọc và danh sách đơn hàng */}
            <section className="overflow-hidden rounded-card border border-border-default bg-bg-surface">
                <div className="flex flex-col gap-4 border-b border-border-default p-4 lg:p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-text-primary">
                                Danh sách đơn hàng
                            </h2>
                            <p className="mt-1 text-sm text-text-secondary">
                                Tìm kiếm và lọc đơn hàng theo thông tin nghiệp vụ.
                            </p>
                        </div>

                        <div className="relative w-full xl:max-w-sm">
                            <Search
                                size={17}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />

                            <input
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                                placeholder="Mã đơn, tên, email, số điện thoại..."
                                aria-label="Tìm kiếm đơn hàng"
                                className="h-11 w-full rounded-btn border border-border-default bg-bg-app pl-10 pr-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <select
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(
                                    event.target.value as OrderStatus | 'all',
                                );
                                setPage(1);
                            }}
                            aria-label="Lọc trạng thái đơn hàng"
                            className="h-11 rounded-btn border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                        >
                            <option value="all">Tất cả trạng thái đơn</option>

                            {Object.entries(orderStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={paymentFilter}
                            onChange={(event) => {
                                setPaymentFilter(
                                    event.target.value as PaymentStatus | 'all',
                                );
                                setPage(1);
                            }}
                            aria-label="Lọc trạng thái thanh toán"
                            className="h-11 rounded-btn border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                        >
                            <option value="all">Tất cả thanh toán</option>

                            {Object.entries(paymentStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={methodFilter}
                            onChange={(event) => {
                                setMethodFilter(
                                    event.target.value as PaymentMethod | 'all',
                                );
                                setPage(1);
                            }}
                            aria-label="Lọc phương thức thanh toán"
                            className="h-11 rounded-btn border border-border-default bg-bg-app px-3 text-sm text-text-primary outline-none transition focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
                        >
                            <option value="all">Tất cả phương thức</option>

                            {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>

                        <Button
                            variant="secondary"
                            onClick={resetFilters}
                            className="w-full"
                        >
                            <RotateCcw size={16} />
                            Đặt lại bộ lọc
                        </Button>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={paginatedOrders}
                    getRowId={(order) => order.id}
                    emptyTitle="Không tìm thấy đơn hàng"
                    emptyDescription="Hãy thử thay đổi từ khóa hoặc điều kiện lọc."
                />

                <div className="border-t border-border-default p-4">

                    <div className="p-4">
                        <Pagination
                            page={currentPage}
                            pageSize={PAGE_SIZE}
                            total={filteredOrders.length}
                            onPageChange={setPage}
                            pageSizeOptions={[7, 10, 20, 50]}
                        />
                    </div>

                </div>
            </section>
        </div>
    );
}
