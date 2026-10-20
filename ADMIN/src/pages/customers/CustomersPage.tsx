
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Crown,
  Download,
  Plus,
  Eye,
  Mail,
  Phone,
  ShoppingBag,
  Wallet,
} from 'lucide-react';

import PageHeader from '../../components/shared/PageHeader';
import SearchBar from '../../components/shared/SearchBar';
import FilterBar from '../../components/shared/FilterBar';
import Pagination from '../../components/shared/Pagination';
import DataTable, {
  type DataTableColumn,
} from '../../components/shared/DataTable';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';

import { Button } from '../../components/ui/buttons/Button';

import { customersMock } from '../../mocks/customers.mock';

import type {
  Customer,
  CustomerSegment,
  CustomerStatus,
} from '../../types/customer.types';

/* =====================================================
   FORMATTERS
===================================================== */

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return 'Chưa có đơn';

  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? 'Chưa có đơn'
    : parsed.toLocaleDateString('vi-VN');
};

const statusLabels: Record<CustomerStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  blocked: 'Đã khóa',
};

const statusVariants: Record<
  CustomerStatus,
  'success' | 'neutral' | 'danger'
> = {
  active: 'success',
  inactive: 'neutral',
  blocked: 'danger',
};

const segmentLabels: Record<CustomerSegment, string> = {
  new: 'Mới',
  regular: 'Thân thiết',
  vip: 'VIP',
};

/* =====================================================
   CUSTOMER SEGMENT BADGE
===================================================== */

function SegmentBadge({
  segment,
}: {
  segment: CustomerSegment;
}) {
  const styles: Record<CustomerSegment, string> = {
    new: 'border-[#1084A9]/25 bg-[#1084A9]/10 text-[#55B9D8]',
    regular: 'border-[#A78BFA]/25 bg-[#A78BFA]/10 text-[#C4B5FD]',
    vip: 'border-[#65D928]/25 bg-[#65D928]/10 text-[#8BE85A]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium ${styles[segment]}`}
    >
      {segment === 'vip' && (
        <Crown size={12} aria-hidden="true" />
      )}

      {segmentLabels[segment]}
    </span>
  );
}

/* =====================================================
   CUSTOMER AVATAR
===================================================== */

function CustomerAvatar({
  customer,
}: {
  customer: Customer;
}) {
  const initials = customer.name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-bg-elevated text-[11px] font-semibold text-accent-primary">
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt={`Ảnh đại diện của ${customer.name}`}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

/* =====================================================
   CUSTOMER STATUS
   Reuse shared StatusBadge
===================================================== */

function CustomerStatusBadge({
  status,
}: {
  status: CustomerStatus;
}) {
  return (
    <StatusBadge
      status={statusLabels[status]}
      variant={statusVariants[status]}
      className="whitespace-nowrap"
    />
  );
}

/* =====================================================
   CUSTOMERS PAGE
===================================================== */

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus | 'all'>('all');
  const [segment, setSegment] = useState<CustomerSegment | 'all'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const customers = customersMock;

  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(
    () => ({
      total: customers.length,

      active: customers.filter(
        (customer) => customer.status === 'active',
      ).length,

      vip: customers.filter(
        (customer) => customer.segment === 'vip',
      ).length,

      spent: customers.reduce(
        (sum, customer) => sum + customer.totalSpent,
        0,
      ),
    }),
    [customers],
  );

  /* =====================================================
     SEARCH AND FILTERS
  ===================================================== */

  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi-VN');

    return customers.filter((customer) => {
      const searchableValues = [
        customer.name,
        customer.code,
        customer.email,
        customer.phone,
      ];

      const matchesSearch =
        !keyword ||
        searchableValues.some((value) =>
          value.toLocaleLowerCase('vi-VN').includes(keyword),
        );

      const matchesStatus =
        status === 'all' || customer.status === status;

      const matchesSegment =
        segment === 'all' || customer.segment === segment;

      return matchesSearch && matchesStatus && matchesSegment;
    });
  }, [customers, search, status, segment]);

  /* =====================================================
     PAGINATION
  ===================================================== */

  const pageCount = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize),
  );

  const safePage = Math.min(Math.max(1, page), pageCount);

  const visibleCustomers = useMemo(
    () =>
      filteredCustomers.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
      ),
    [filteredCustomers, safePage, pageSize],
  );

  /* =====================================================
     RESET FILTERS
  ===================================================== */

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setSegment('all');
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search.trim()) || status !== 'all' || segment !== 'all';

  /* =====================================================
     TABLE COLUMNS
     Reuse shared DataTable
  ===================================================== */

  const columns: DataTableColumn<Customer>[] = [
    {
      key: 'customer',
      header: 'Khách hàng',
      className: 'min-w-[190px]',
      headerClassName: 'min-w-[190px]',
      render: (customer) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <CustomerAvatar customer={customer} />

          <div className="min-w-0">
            <Link
              to={`/customers/${customer.id}`}
              title={customer.name}
              className="block max-w-50 truncate text-xs font-semibold text-text-primary transition-colors hover:text-accent-primary"
            >
              {customer.name}
            </Link>

            <p className="mt-0.5 text-[10px] text-text-muted">
              {customer.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Thông tin liên hệ',
      className: 'min-w-[200px]',
      headerClassName: 'min-w-[200px]',
      render: (customer) => (
        <div className="min-w-0 space-y-1.5">
          <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-secondary">
            <Mail
              size={12}
              className="shrink-0 text-text-muted"
              aria-hidden="true"
            />

            <span className="truncate" title={customer.email}>
              {customer.email || 'Chưa cập nhật'}
            </span>
          </p>

          <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted">
            <Phone
              size={12}
              className="shrink-0"
              aria-hidden="true"
            />

            <span className="truncate">
              {customer.phone || 'Chưa cập nhật'}
            </span>
          </p>
        </div>
      ),
    },
    {
      key: 'segment',
      header: 'Phân nhóm',
      className: 'min-w-[130px]',
      headerClassName: 'min-w-[130px]',
      render: (customer) => (
        <SegmentBadge segment={customer.segment} />
      ),
    },
    {
      key: 'orders',
      header: 'Đơn hàng',
      className: 'min-w-[95px] text-center',
      headerClassName: 'min-w-[95px] text-center',
      render: (customer) => (
        <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-text-primary">
          <ShoppingBag
            size={13}
            className="text-text-muted"
            aria-hidden="true"
          />

          {customer.totalOrders.toLocaleString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'spent',
      header: 'Tổng chi tiêu',
      className: 'min-w-[140px]',
      headerClassName: 'min-w-[140px]',
      render: (customer) => (
        <span className="whitespace-nowrap text-xs font-semibold text-text-primary">
          {money(customer.totalSpent)}
        </span>
      ),
    },
    {
      key: 'lastOrder',
      header: 'Mua gần nhất',
      className: 'min-w-[120px]',
      headerClassName: 'min-w-[120px]',
      render: (customer) => (
        <span className="whitespace-nowrap text-[11px] text-text-secondary">
          {formatDate(customer.lastOrderDate)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'min-w-[130px]',
      headerClassName: 'min-w-[130px]',
      render: (customer) => (
        <CustomerStatusBadge status={customer.status} />
      ),
    },
    {
      key: 'actions',
      header: 'Chi tiết',
      className: 'min-w-[80px] text-right',
      headerClassName: 'min-w-[80px] text-right',
      render: (customer) => (
        <div className="flex justify-end">
          <Link
            to={`/customers/${customer.id}`}
            title="Xem chi tiết"
            aria-label={`Xem chi tiết ${customer.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:border-accent-primary/40 hover:bg-accent-primary/10 hover:text-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            <Eye size={15} aria-hidden="true" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">
        {/* PAGE HEADER */}

        <PageHeader
          eyebrow="Quản lý / Khách hàng"
          title="Khách hàng"
          description="Theo dõi hồ sơ, phân nhóm và lịch sử mua hàng."
          actions={
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.print()}
              >
                <Download size={16} aria-hidden="true" />
                <span className="hidden sm:inline">Xuất / In</span>
              </Button>

              <Button
                type="button"
                disabled
                title="Chức năng thêm khách hàng chưa được triển khai"
              >
                <Plus size={17} aria-hidden="true" />
                Thêm khách hàng
              </Button>
            </>
          }
        />

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <StatCard
              label="Tổng khách hàng"
              value={stats.total.toLocaleString('vi-VN')}
              icon={Users}
              accent="primary"
            />

            <p className="px-1 pt-2 text-xs text-text-muted">
              Tất cả hồ sơ khách hàng
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Đang hoạt động"
              value={stats.active.toLocaleString('vi-VN')}
              icon={UserCheck}
              accent="primary"
            />

            <p className="px-1 pt-2 text-xs text-text-muted">
              Tài khoản đang hoạt động
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Khách hàng VIP"
              value={stats.vip.toLocaleString('vi-VN')}
              icon={Crown}
              accent="primary"
            />

            <p className="px-1 pt-2 text-xs text-text-muted">
              Nhóm khách hàng giá trị cao
            </p>
          </div>

          <div className="min-w-0">
            <StatCard
              label="Tổng chi tiêu"
              value={money(stats.spent)}
              icon={Wallet}
              accent="cyan"
            />

            <p className="px-1 pt-2 text-xs text-text-muted">
              Tổng giá trị mua hàng mẫu
            </p>
          </div>
        </div>

        {/* CUSTOMER LIST */}

        <section className="min-w-0 overflow-hidden rounded-xl border border-border-default bg-bg-surface">
          {/* TABLE HEADER */}

          <div className="flex flex-col gap-3 border-b border-border-default p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Danh sách khách hàng
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                {filteredCustomers.length.toLocaleString('vi-VN')} kết quả
                {' · '}
                Dữ liệu mẫu
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
                    value={search}
                    onChange={(value) => {
                      setSearch(value);
                      setPage(1);
                    }}
                    placeholder="Tìm tên, mã, email, số điện thoại..."
                    className="w-full"
                    ariaLabel="Tìm kiếm khách hàng"
                  />
                </div>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-text-secondary sm:min-w-[145px]">
                  <span>Trạng thái</span>

                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(
                        event.target.value as CustomerStatus | 'all',
                      );
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="blocked">Đã khóa</option>
                  </select>
                </label>

                <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-text-secondary sm:min-w-[145px]">
                  <span>Phân nhóm</span>

                  <select
                    value={segment}
                    onChange={(event) => {
                      setSegment(
                        event.target.value as CustomerSegment | 'all',
                      );
                      setPage(1);
                    }}
                    className="h-10 w-full rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15"
                  >
                    <option value="all">Tất cả nhóm</option>
                    <option value="new">Khách hàng mới</option> 
                    <option value="regular">Thân thiết</option>
                    <option value="vip">VIP</option>
                  </select>
                </label>
              </FilterBar>
            </div>
          </div>

          {/* RESULT SUMMARY */}

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-[11px] text-text-muted sm:px-4">
            <span>
              Hiển thị{' '}
              <strong className="font-semibold text-text-primary">
                {visibleCustomers.length}
              </strong>{' '}
              / {filteredCustomers.length} khách hàng
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
              Dữ liệu mẫu
            </span>
          </div>

          {/* SHARED DATA TABLE */}

          <div className="min-w-0 overflow-x-auto px-3 pb-3 sm:px-4">
            <div className="min-w-[1050px]">
              <DataTable
                columns={columns}
                data={visibleCustomers}
                getRowId={(customer) => customer.id}
                emptyTitle="Không tìm thấy khách hàng"
                emptyDescription="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."
              />
            </div>
          </div>

          {/* SHARED PAGINATION */}

          <div className="px-3 pb-4 sm:px-4">
            <Pagination
              page={safePage}
              pageSize={pageSize}
              total={filteredCustomers.length}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
