
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Clock,
  DollarSign,
  ShoppingBag,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Header from '../../layouts/Header';

import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import DataTable, {
  type DataTableColumn,
} from '../../components/shared/DataTable';

import { Button } from '../../components/ui/buttons/Button';

import {
  stats,
  recentOrders,
  topProducts,
} from '../../mocks/dashboard.mock';

import { cn } from '../../utils/cn';

/* =====================================================
   TYPES
===================================================== */

type DashboardIconName =
  | 'DollarSign'
  | 'ShoppingBag'
  | 'Users'
  | 'Clock';

type RevenuePeriod = '7 days' | '30 days' | '90 days';

interface RevenuePoint {
  label: string;
  height: number;
}

/* =====================================================
   ICON MAP
===================================================== */

const iconMap: Record<DashboardIconName, LucideIcon> = {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
};

/* =====================================================
   REVENUE CHART MOCK
   Dữ liệu minh họa cho giao diện dashboard
===================================================== */

const revenueData: Record<RevenuePeriod, RevenuePoint[]> = {
  '7 days': [
    { label: 'T2', height: 42 },
    { label: 'T3', height: 58 },
    { label: 'T4', height: 47 },
    { label: 'T5', height: 76 },
    { label: 'T6', height: 64 },
    { label: 'T7', height: 88 },
    { label: 'CN', height: 72 },
  ],

  '30 days': [
    { label: '1', height: 40 },
    { label: '4', height: 55 },
    { label: '7', height: 48 },
    { label: '10', height: 70 },
    { label: '13', height: 62 },
    { label: '16', height: 85 },
    { label: '19', height: 78 },
    { label: '22', height: 90 },
    { label: '25', height: 72 },
    { label: '28', height: 88 },
    { label: '30', height: 95 },
  ],

  '90 days': [
    { label: 'T1', height: 35 },
    { label: 'T2', height: 48 },
    { label: 'T3', height: 42 },
    { label: 'T4', height: 57 },
    { label: 'T5', height: 51 },
    { label: 'T6', height: 68 },
    { label: 'T7', height: 61 },
    { label: 'T8', height: 82 },
    { label: 'T9', height: 93 },
  ],
};

/* =====================================================
   TABLE COLUMNS
===================================================== */

const orderColumns: DataTableColumn<(typeof recentOrders)[number]>[] = [
  {
    key: 'order',
    header: 'Mã đơn hàng',
    render: (order) => (
      <span className="whitespace-nowrap text-sm font-semibold text-text-primary">
        {order.id}
      </span>
    ),
  },
  {
    key: 'customer',
    header: 'Khách hàng',
    render: (order) => (
      <span className="text-sm text-text-secondary">
        {order.customer}
      </span>
    ),
  },
  {
    key: 'date',
    header: 'Ngày đặt',
    render: (order) => (
      <span className="whitespace-nowrap text-sm text-text-muted">
        {order.date}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (order) => <StatusBadge status={order.status} />,
  },
  {
    key: 'total',
    header: 'Tổng tiền',
    className: 'text-right',
    headerClassName: 'text-right',
    render: (order) => (
      <span className="block whitespace-nowrap text-right text-sm font-semibold text-text-primary">
        {order.total}
      </span>
    ),
  },
];

/* =====================================================
   DASHBOARD PAGE
===================================================== */

export default function DashboardPage() {
  const [revenuePeriod, setRevenuePeriod] =
    useState<RevenuePeriod>('30 days');

  const chartData = useMemo(
    () => revenueData[revenuePeriod],
    [revenuePeriod],
  );

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Overview of your store performance"
      />

      <main className="min-w-0 space-y-5 p-4 sm:p-5 lg:space-y-6 lg:p-8">
        {/* STATISTICS */}

        <section
          aria-label="Thống kê tổng quan"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4"
        >
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              accent={stat.accent}
              icon={iconMap[stat.icon as DashboardIconName]}
            />
          ))}
        </section>

        {/* REVENUE CHART AND TOP PRODUCTS */}

        <section className="grid min-w-0 grid-cols-1 gap-4 lg:gap-5 xl:grid-cols-3">
          {/* REVENUE CHART */}

          <div className="min-w-0 rounded-card border border-border-default bg-bg-surface p-4 sm:p-5 xl:col-span-2">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-text-primary">
                  Revenue Overview
                </h2>

                <p className="mt-1 text-xs text-text-muted">
                  Doanh thu theo khoảng thời gian
                </p>
              </div>

              <label className="sr-only" htmlFor="revenue-period">
                Khoảng thời gian doanh thu
              </label>

              <select
                id="revenue-period"
                value={revenuePeriod}
                onChange={(event) =>
                  setRevenuePeriod(event.target.value as RevenuePeriod)
                }
                className={cn(
                  'h-9 rounded-btn border border-border-strong',
                  'bg-bg-elevated px-3 text-xs text-text-primary',
                  'outline-none transition-colors',
                  'focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15',
                )}
              >
                <option value="7 days">7 ngày</option>
                <option value="30 days">30 ngày</option>
                <option value="90 days">90 ngày</option>
              </select>
            </div>

            {/* BAR CHART */}

            <div
              role="img"
              aria-label={`Biểu đồ doanh thu minh họa trong ${revenuePeriod}`}
              className="flex h-56 items-end gap-2 border-b border-border-default pb-2 sm:h-64 sm:gap-3"
            >
              {chartData.map((point) => (
                <div
                  key={point.label}
                  className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                >
                  <div
                    title={`${point.label}: dữ liệu minh họa`}
                    className={cn(
                      'w-full rounded-t-md',
                      'bg-accent-primary/20',
                      'transition-colors duration-200',
                      'group-hover:bg-accent-primary/50',
                    )}
                    style={{ height: `${point.height}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-between gap-1 text-[10px] text-text-muted sm:text-[11px]">
              {chartData.map((point) => (
                <span
                  key={point.label}
                  className="min-w-0 flex-1 truncate text-center"
                >
                  {point.label}
                </span>
              ))}
            </div>

            <p className="mt-3 text-[11px] text-text-muted">
              Biểu đồ minh họa — chưa kết nối dữ liệu doanh thu thực tế.
            </p>
          </div>

          {/* TOP PRODUCTS */}

          <div className="min-w-0 rounded-card border border-border-default bg-bg-surface p-4 sm:p-5">
            <div className="mb-5">
              <h2 className="font-semibold text-text-primary">
                Top Products
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                Sản phẩm có doanh thu nổi bật
              </p>
            </div>

            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn border border-border-default bg-bg-elevated text-xs font-bold text-text-secondary">
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        title={product.name}
                        className="truncate text-sm font-medium text-text-primary"
                      >
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        {product.sold.toLocaleString('vi-VN')} đã bán
                      </p>
                    </div>

                    <p className="shrink-0 text-right text-xs font-semibold text-text-primary sm:text-sm">
                      {product.revenue}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 items-center justify-center text-center text-sm text-text-muted">
                Chưa có dữ liệu sản phẩm.
              </div>
            )}
          </div>
        </section>

        {/* RECENT ORDERS */}

        <section className="min-w-0 overflow-hidden rounded-card border border-border-default bg-bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default p-4 sm:p-5">
            <div>
              <h2 className="font-semibold text-text-primary">
                Recent Orders
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                Các đơn hàng gần đây
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => {
                window.location.assign('/orders');
              }}
            >
              Xem tất cả
              <ArrowUpRight size={14} aria-hidden="true" />
            </Button>
          </div>

          <div className="min-w-0 overflow-x-auto p-3 sm:p-4">
            <div className="min-w-162.5">
              <DataTable
                columns={orderColumns}
                data={recentOrders}
                getRowId={(order) => order.id}
                emptyTitle="Chưa có đơn hàng"
                emptyDescription="Các đơn hàng gần đây sẽ hiển thị tại đây."
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border-default px-4 py-3">
            <p className="text-xs text-text-muted">
              Hiển thị {recentOrders.length} đơn hàng gần đây
            </p>

            <Link
              to="/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent-primary transition-colors hover:text-accent-hover"
            >
              Quản lý đơn hàng
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
