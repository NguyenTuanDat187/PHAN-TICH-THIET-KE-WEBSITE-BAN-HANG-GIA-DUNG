import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Crown,
  Search,
  SlidersHorizontal,
  Download,
  Plus,
  Eye,
  MoreHorizontal,
  Mail,
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Wallet,
  X,
} from "lucide-react";

import { customersMock } from "../../mocks/customers.mock";
import type {
  Customer,
  CustomerSegment,
  CustomerStatus,
} from "../../types/customer.types";

/* =========================
   FORMATTERS
========================= */

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) => {
  if (!value) return "Chưa có đơn";

  const parsed = new Date(`${value}T00:00:00`);

  return Number.isNaN(parsed.getTime())
    ? "Chưa có đơn"
    : parsed.toLocaleDateString("vi-VN");
};

const statusLabels: Record<CustomerStatus, string> = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
  blocked: "Đã khóa",
};

const segmentLabels: Record<CustomerSegment, string> = {
  new: "Mới",
  regular: "Thân thiết",
  vip: "VIP",
};

/* =========================
   STATUS BADGE
========================= */

function StatusPill({
  status,
}: {
  status: CustomerStatus;
}) {
  const styles: Record<CustomerStatus, string> = {
    active:
      "border-[#65D928]/20 bg-[#65D928]/10 text-[#8BE85A]",
    inactive:
      "border-[#858987]/20 bg-[#858987]/10 text-[#B5B7B6]",
    blocked:
      "border-[#F04438]/20 bg-[#F04438]/10 text-[#FF8178]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabels[status]}
    </span>
  );
}

/* =========================
   CUSTOMER SEGMENT BADGE
========================= */

function SegmentPill({
  segment,
}: {
  segment: CustomerSegment;
}) {
  const styles: Record<CustomerSegment, string> = {
    new: "border-[#1084A9]/25 bg-[#1084A9]/10 text-[#55B9D8]",
    regular:
      "border-[#A78BFA]/25 bg-[#A78BFA]/10 text-[#C4B5FD]",
    vip: "border-[#65D928]/25 bg-[#65D928]/10 text-[#8BE85A]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] font-medium ${styles[segment]}`}
    >
      {segment === "vip" && <Crown size={12} />}
      {segmentLabels[segment]}
    </span>
  );
}

/* =========================
   CUSTOMER AVATAR
========================= */

function Avatar({
  customer,
}: {
  customer: Customer;
}) {
  const initials = customer.name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-bg-elevated text-[11px] font-semibold text-[#65D928]">
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt={customer.name}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

/* =========================
   STATISTIC CARD
========================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Users;
  accent: string;
}) {
  return (
    <section className="min-w-0 rounded-xl border border-border-default bg-bg-surface p-3 transition-colors duration-200 hover:bg-bg-elevated sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-text-secondary">
            {title}
          </p>

          <p className="mt-2 truncate text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-elevated ${accent}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-2 truncate text-[11px] text-text-muted">
        {description}
      </p>
    </section>
  );
}

/* =========================
   INPUT STYLE
========================= */

const controlClass =
  "h-10 rounded-lg border border-border-strong bg-bg-app px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/15";

/* =========================
   CUSTOMERS PAGE
========================= */

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [segment, setSegment] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const customers = customersMock;

  /* Statistics */

  const stats = useMemo(() => {
    return {
      total: customers.length,

      active: customers.filter(
        (customer) => customer.status === "active",
      ).length,

      vip: customers.filter(
        (customer) => customer.segment === "vip",
      ).length,

      spent: customers.reduce(
        (sum, customer) => sum + customer.totalSpent,
        0,
      ),
    };
  }, [customers]);

  /* Search and filters */

  const filtered = useMemo(() => {
    const keyword = search
      .trim()
      .toLocaleLowerCase("vi-VN");

    return customers.filter((customer) => {
      const matchesSearch =
        !keyword ||
        [
          customer.name,
          customer.code,
          customer.email,
          customer.phone,
        ].some((value) =>
          value.toLocaleLowerCase("vi-VN").includes(keyword),
        );

      const matchesStatus =
        status === "all" || customer.status === status;

      const matchesSegment =
        segment === "all" || customer.segment === segment;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSegment
      );
    });
  }, [customers, search, status, segment]);

  /* Pagination */

  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / pageSize),
  );

  const safePage = Math.min(page, pageCount);

  const visibleCustomers = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  /* Reset filters */

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setSegment("all");
    setPage(1);
  };

  return (
    <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">

        {/* PAGE HEADER */}

        <header className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-medium text-text-muted">
              <span>Quản lý</span>
              <span>/</span>
              <span className="text-text-secondary">
                Khách hàng
              </span>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              Khách hàng
            </h1>

            <p className="mt-1 text-xs text-text-secondary">
              Theo dõi hồ sơ, phân nhóm và lịch sử mua hàng.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-3 text-sm font-medium text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              <Download size={16} />
              <span className="hidden sm:inline">
                Xuất / In
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                alert(
                  "Giao diện thêm khách hàng sẽ được tích hợp sau.",
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent-primary px-3.5 text-sm font-semibold text-[#111111] transition-colors duration-200 hover:bg-accent-hover active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app"
            >
              <Plus size={17} />
              Thêm khách hàng
            </button>
          </div>
        </header>

        {/* STATISTICS */}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatCard
            title="Tổng khách hàng"
            value={stats.total.toLocaleString("vi-VN")}
            description="Tất cả hồ sơ khách hàng"
            icon={Users}
            accent="text-[#65D928]"
          />

          <StatCard
            title="Đang hoạt động"
            value={stats.active.toLocaleString("vi-VN")}
            description="Tài khoản đang hoạt động"
            icon={UserCheck}
            accent="text-[#65D928]"
          />

          <StatCard
            title="Khách hàng VIP"
            value={stats.vip.toLocaleString("vi-VN")}
            description="Nhóm khách hàng giá trị cao"
            icon={Crown}
            accent="text-[#8BE85A]"
          />

          <StatCard
            title="Tổng chi tiêu"
            value={money(stats.spent)}
            description="Tổng giá trị mua hàng mẫu"
            icon={Wallet}
            accent="text-[#55B9D8]"
          />
        </div>

        {/* CUSTOMER TABLE */}

        <section className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-3 border-b border-border-default p-3 sm:p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Danh sách khách hàng
              </h2>

              <p className="mt-1 text-xs text-text-muted">
                {filtered.length.toLocaleString("vi-VN")} kết quả
                {" · "}
                Dữ liệu mẫu
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* SEARCH */}

              <div className="relative min-w-0 sm:w-64 xl:w-72">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm tên, mã, email, số điện thoại..."
                  aria-label="Tìm kiếm khách hàng"
                  className={`${controlClass} w-full pl-9 pr-9`}
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Xóa nội dung tìm kiếm"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* FILTER BUTTON */}

              <button
                type="button"
                onClick={() =>
                  setShowFilters((current) => !current)
                }
                aria-expanded={showFilters}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                  showFilters
                    ? "border-accent-primary/50 bg-accent-primary/10 text-[#8BE85A]"
                    : "border-border-strong bg-bg-surface text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                }`}
              >
                <SlidersHorizontal size={16} />
                Bộ lọc

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* FILTER PANEL */}

          {showFilters && (
            <div className="grid grid-cols-1 gap-3 border-b border-border-default bg-bg-app p-3 sm:grid-cols-3 sm:p-4">
              <label className="space-y-1.5 text-xs font-medium text-text-secondary">
                Trạng thái

                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setPage(1);
                  }}
                  className={`${controlClass} w-full`}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">
                    Không hoạt động
                  </option>
                  <option value="blocked">Đã khóa</option>
                </select>
              </label>

              <label className="space-y-1.5 text-xs font-medium text-text-secondary">
                Phân nhóm khách hàng

                <select
                  value={segment}
                  onChange={(event) => {
                    setSegment(event.target.value);
                    setPage(1);
                  }}
                  className={`${controlClass} w-full`}
                >
                  <option value="all">Tất cả nhóm</option>
                  <option value="new">Khách hàng mới</option>
                  <option value="regular">Thân thiết</option>
                  <option value="vip">VIP</option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 w-full rounded-lg border border-border-strong bg-bg-surface px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}

          {/* RESULT COUNT */}

          <div className="flex items-center justify-between gap-2 px-3 py-2.5 text-[11px] text-text-muted sm:px-4">
            <span>
              Hiển thị{" "}
              <strong className="font-semibold text-text-primary">
                {visibleCustomers.length}
              </strong>{" "}
              / {filtered.length} khách hàng
            </span>

            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
              Dữ liệu mẫu
            </span>
          </div>

          {/* RESPONSIVE TABLE */}

          <div className="w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <colgroup>
                <col className="w-[23%]" />
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="border-y border-border-default bg-bg-elevated/60 text-[10px] uppercase tracking-wide text-text-muted">
                  <th className="px-3 py-3 font-semibold">
                    Khách hàng
                  </th>

                  <th className="px-2 py-3 font-semibold">
                    Liên hệ
                  </th>

                  <th className="px-2 py-3 font-semibold">
                    Phân nhóm
                  </th>

                  <th className="px-2 py-3 text-center font-semibold">
                    Đơn
                  </th>

                  <th className="px-2 py-3 font-semibold">
                    Chi tiêu
                  </th>

                  <th className="px-2 py-3 font-semibold">
                    Mua gần nhất
                  </th>

                  <th className="px-3 py-3 text-right font-semibold">
                    Trạng thái / Xem
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-default">
                {visibleCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group transition-colors duration-150 hover:bg-bg-hover/70"
                  >
                    {/* CUSTOMER */}

                    <td className="px-3 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar customer={customer} />

                        <div className="min-w-0">
                          <Link
                            to={`/customers/${customer.id}`}
                            className="block truncate text-xs font-semibold text-text-primary transition-colors hover:text-accent-primary"
                            title={customer.name}
                          >
                            {customer.name}
                          </Link>

                          <p className="mt-0.5 truncate text-[10px] text-text-muted">
                            {customer.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CONTACT */}

                    <td className="px-2 py-2.5">
                      <div className="min-w-0 space-y-1">
                        <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-secondary">
                          <Mail
                            size={12}
                            className="shrink-0 text-text-muted"
                          />

                          <span
                            className="truncate"
                            title={customer.email}
                          >
                            {customer.email}
                          </span>
                        </p>

                        <p className="flex min-w-0 items-center gap-1.5 text-[11px] text-text-muted">
                          <Phone
                            size={12}
                            className="shrink-0"
                          />

                          <span className="truncate">
                            {customer.phone}
                          </span>
                        </p>
                      </div>
                    </td>

                    {/* SEGMENT */}

                    <td className="px-2 py-2.5">
                      <SegmentPill
                        segment={customer.segment}
                      />
                    </td>

                    {/* ORDERS */}

                    <td className="px-2 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-xs font-medium text-text-primary">
                        <ShoppingBag
                          size={13}
                          className="text-text-muted"
                        />

                        {customer.totalOrders}
                      </span>
                    </td>

                    {/* SPENDING */}

                    <td className="px-2 py-2.5">
                      <span
                        className="block truncate text-xs font-semibold text-text-primary"
                        title={money(customer.totalSpent)}
                      >
                        {money(customer.totalSpent)}
                      </span>
                    </td>

                    {/* LAST ORDER */}

                    <td className="px-2 py-2.5 text-[11px] text-text-secondary">
                      <span
                        className="block truncate"
                        title={formatDate(customer.lastOrderDate)}
                      >
                        {formatDate(customer.lastOrderDate)}
                      </span>
                    </td>

                    {/* STATUS AND ACTIONS */}

                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <StatusPill
                          status={customer.status}
                        />

                        <Link
                          to={`/customers/${customer.id}`}
                          title="Xem chi tiết"
                          aria-label={`Xem chi tiết ${customer.name}`}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors hover:border-accent-primary/40 hover:bg-accent-primary/10 hover:text-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                        >
                          <Eye size={15} />
                        </Link>

                        <button
                          type="button"
                          title="Thao tác khác"
                          aria-label={`Thao tác khác với ${customer.name}`}
                          onClick={() =>
                            alert(
                              `Menu thao tác cho ${customer.name} sẽ được bổ sung sau.`,
                            )
                          }
                          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary 2xl:inline-flex"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}

                {visibleCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center"
                    >
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-text-muted">
                        <Users size={20} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-text-primary">
                        Không tìm thấy khách hàng
                      </p>

                      <p className="mt-1 text-xs text-text-muted">
                        Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
                      </p>

                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-3 text-xs font-semibold text-accent-primary hover:text-accent-hover"
                      >
                        Đặt lại bộ lọc
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <footer className="flex flex-col gap-3 border-t border-border-default px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span>Số dòng</span>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-md border border-border-strong bg-bg-app px-2 text-xs text-text-primary outline-none focus:border-accent-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span className="text-xs text-text-muted">
                Trang {safePage} / {pageCount}
              </span>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  aria-label="Trang trước"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  disabled={safePage >= pageCount}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pageCount, current + 1),
                    )
                  }
                  aria-label="Trang sau"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong text-text-secondary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}