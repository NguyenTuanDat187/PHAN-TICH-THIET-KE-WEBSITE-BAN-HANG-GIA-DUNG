import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShoppingBag,
  Wallet,
  Crown,
  Pencil,
  Ban,
  Clock3,
  Package,
  ReceiptText,
  Ellipsis,
} from "lucide-react";

import { customersMock } from "../../mocks/customers.mock";
import type {
  Customer,
  CustomerStatus,
  CustomerSegment,
} from "../../types/customer.types";

/* =====================================================
   FORMATTERS
===================================================== */

const money = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const date = (value: string) => {
  if (!value) return "Chưa có đơn hàng";

  const parsed = new Date(`${value}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "Chưa có đơn hàng";
  }

  return parsed.toLocaleDateString("vi-VN");
};

const statusText: Record<CustomerStatus, string> = {
  active: "Hoạt động",
  inactive: "Không hoạt động",
  blocked: "Đã khóa",
};

const segmentText: Record<CustomerSegment, string> = {
  new: "Khách hàng mới",
  regular: "Khách hàng thân thiết",
  vip: "Khách hàng VIP",
};

/* =====================================================
   SHARED STYLES
===================================================== */

const panelClass =
  "rounded-xl border border-border-default bg-bg-surface";


const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 text-sm font-semibold text-[#111111] transition-colors duration-200 hover:bg-accent-hover active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-app";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-surface px-3.5 text-sm font-medium text-text-secondary transition-colors duration-200 hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary";

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-default text-text-secondary transition-colors duration-200 hover:border-accent-primary/40 hover:bg-accent-primary/10 hover:text-accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary";

/* =====================================================
   STATUS BADGE
===================================================== */

function StatusBadge({
  status,
}: {
  status: CustomerStatus;
}) {
  const styles: Record<CustomerStatus, string> = {
    active:
      "border-[#65D928]/25 bg-[#65D928]/10 text-[#8BE85A]",
    inactive:
      "border-[#858987]/25 bg-[#858987]/10 text-[#B5B7B6]",
    blocked:
      "border-[#F04438]/25 bg-[#F04438]/10 text-[#FF8178]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusText[status]}
    </span>
  );
}

/* =====================================================
   CUSTOMER SEGMENT BADGE
===================================================== */

function SegmentBadge({
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
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${styles[segment]}`}
    >
      {segment === "vip" && <Crown size={13} />}
      {segmentText[segment]}
    </span>
  );
}

/* =====================================================
   STATISTIC CARD
===================================================== */

function DetailStat({
  icon: Icon,
  label,
  value,
  description,
  accent,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  description: string;
  accent: string;
}) {
  return (
    <section className={`${panelClass} min-w-0 p-4 transition-colors duration-200 hover:bg-bg-elevated sm:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-secondary">
            {label}
          </p>

          <p className="mt-2 wrap-break-word text-xl font-semibold tracking-tight text-text-primary">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-elevated ${accent}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        {description}
      </p>
    </section>
  );
}

/* =====================================================
   INFORMATION ROW
===================================================== */

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 border-b border-border-default py-3 last:border-b-0">
      <div className="mt-0.5 shrink-0 text-text-muted">
        <Icon size={16} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-text-muted">
          {label}
        </p>

        <p className="mt-1 wrap-break-word text-sm text-text-primary">
          {value || "Chưa cập nhật"}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   CUSTOMER AVATAR
===================================================== */

function ProfileAvatar({
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
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-strong bg-bg-elevated text-xl font-bold text-accent-primary sm:h-[72px] sm:w-[72px] sm:text-2xl">
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

/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default px-4 py-4 sm:px-5">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs text-text-muted">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* =====================================================
   CUSTOMER DETAIL PAGE
===================================================== */

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();

  const customer = customersMock.find(
    (item) => String(item.id) === id,
  );

  /* Customer not found */

  if (!customer) {
    return (
      <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-6">
        <div className={`${panelClass} mx-auto max-w-2xl p-8 text-center sm:p-12`}>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-text-muted">
            <UsersFallback />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-text-primary">
            Không tìm thấy khách hàng
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Hồ sơ khách hàng không tồn tại trong dữ liệu hiện tại.
          </p>

          <Link to="/customers" className={`${primaryButtonClass} mt-6`}>
            <ArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg-app p-4 text-text-primary sm:p-5 xl:p-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4">

        {/* BREADCRUMB */}

        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-text-muted"
        >
          <Link
            to="/dashboard"
            className="transition-colors hover:text-accent-primary"
          >
            Dashboard
          </Link>

          <span>/</span>

          <Link
            to="/customers"
            className="transition-colors hover:text-accent-primary"
          >
            Khách hàng
          </Link>

          <span>/</span>

          <span className="font-medium text-text-secondary">
            {customer.code}
          </span>
        </nav>

        {/* BACK LINK */}

        <div>
          <Link
            to="/customers"
            className="mb-3 inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-accent-primary"
          >
            <ArrowLeft size={15} />
            Quay lại danh sách khách hàng
          </Link>

          {/* CUSTOMER PROFILE HEADER */}

          <section className={`${panelClass} p-4 sm:p-5`}>
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <ProfileAvatar customer={customer} />

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="wrap-break-word text-lg font-semibold tracking-tight text-text-primary sm:text-2xl">
                      {customer.name}
                    </h1>

                    {customer.segment === "vip" && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#65D928]/25 bg-[#65D928]/10 px-2 py-1 text-[11px] font-semibold text-[#8BE85A]">
                        <Crown size={12} />
                        VIP
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-text-muted">
                    Mã khách hàng: {customer.code}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <SegmentBadge segment={customer.segment} />
                    <StatusBadge status={customer.status} />
                  </div>
                </div>
              </div>

              {/* PROFILE ACTIONS */}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Chức năng chỉnh sửa khách hàng sẽ được tích hợp sau.",
                    )
                  }
                  className={secondaryButtonClass}
                >
                  <Pencil size={15} />
                  Chỉnh sửa
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Chức năng khóa tài khoản sẽ được tích hợp sau.",
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-status-danger/30
                   bg-status-danger/5 px-3.5 text-sm font-medium text-[#FF8178] transition-colors duration-200
                    hover:bg-status-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger"
                >
                  <Ban size={15} />
                  Khóa tài khoản
                </button>

                <button
                  type="button"
                  aria-label="Thao tác khác"
                  onClick={() =>
                    alert("Menu thao tác sẽ được tích hợp sau.")
                  }
                  className={iconButtonClass}
                >
                  <Ellipsis size={19} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* CUSTOMER STATISTICS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStat
            icon={ShoppingBag}
            label="Tổng đơn hàng"
            value={customer.totalOrders.toLocaleString("vi-VN")}
            description="Số đơn hàng đã ghi nhận"
            accent="text-[#65D928]"
          />

          <DetailStat
            icon={Wallet}
            label="Tổng chi tiêu"
            value={money(customer.totalSpent)}
            description="Tổng giá trị mua hàng"
            accent="text-[#55B9D8]"
          />

          <DetailStat
            icon={CalendarDays}
            label="Ngày tham gia"
            value={date(customer.createdAt)}
            description="Ngày tạo hồ sơ khách hàng"
            accent="text-[#A78BFA]"
          />

          <DetailStat
            icon={Clock3}
            label="Đơn hàng gần nhất"
            value={date(customer.lastOrderDate)}
            description="Thời điểm mua hàng gần nhất"
            accent="text-[#F59E0B]"
          />
        </div>

        {/* MAIN CONTENT */}

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">

          {/* PERSONAL INFORMATION */}

          <section className={`${panelClass} min-w-0 xl:col-span-1`}>
            <SectionHeading
              title="Thông tin cá nhân"
              description="Thông tin liên hệ và hồ sơ"
              action={
                <button
                  type="button"
                  aria-label="Chỉnh sửa thông tin cá nhân"
                  onClick={() =>
                    alert(
                      "Chức năng chỉnh sửa thông tin sẽ được tích hợp sau.",
                    )
                  }
                  className={iconButtonClass}
                >
                  <Pencil size={15} />
                </button>
              }
            />

            <div className="px-4 sm:px-5">
              <InfoRow
                icon={Mail}
                label="Địa chỉ email"
                value={customer.email}
              />

              <InfoRow
                icon={Phone}
                label="Số điện thoại"
                value={customer.phone}
              />

              <InfoRow
                icon={MapPin}
                label="Địa chỉ"
                value={customer.address}
              />

              <InfoRow
                icon={CalendarDays}
                label="Ngày đăng ký"
                value={date(customer.createdAt)}
              />

              <InfoRow
                icon={ReceiptText}
                label="Mã khách hàng"
                value={customer.code}
              />
            </div>

            {/* CUSTOMER NOTES */}

            <div className="mx-4 mb-4 mt-2 rounded-lg border border-border-default bg-bg-app p-3 sm:mx-5 sm:mb-5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />

                <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
                  Ghi chú
                </p>
              </div>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
                {customer.notes ||
                  "Chưa có ghi chú cho khách hàng này."}
              </p>
            </div>
          </section>

          {/* ORDER HISTORY */}

          <section className={`${panelClass} min-w-0 xl:col-span-2`}>
            <SectionHeading
              title="Lịch sử đơn hàng"
              description="Tổng quan hoạt động mua hàng của khách hàng"
              action={
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Trang danh sách đơn hàng sẽ được tích hợp sau.",
                    )
                  }
                  className="text-xs font-semibold text-accent-primary transition-colors hover:text-accent-hover"
                >
                  Xem tất cả
                </button>
              }
            />

            <div className="p-4 sm:p-5">

              {/* ORDER SUMMARY */}

              <div className="flex flex-col gap-3 rounded-lg border border-border-default bg-bg-elevated/60 p-4 sm:flex-row sm:items-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-surface text-accent-primary">
                  <Package size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">
                    Thống kê đơn hàng
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {customer.totalOrders.toLocaleString("vi-VN")} đơn hàng đã ghi nhận
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-sm font-semibold text-text-primary">
                    {money(customer.totalSpent)}
                  </p>

                  <p className="mt-1 text-[11px] text-text-muted">
                    Tổng chi tiêu
                  </p>
                </div>
              </div>

              {/* ORDER EMPTY STATE */}

              <div className="mt-4 rounded-lg border border-dashed border-border-strong bg-bg-app px-4 py-9 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-border-default bg-bg-elevated text-text-muted">
                  <ReceiptText size={21} />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-text-primary">
                  Chưa có dữ liệu chi tiết đơn hàng
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-text-secondary">
                  Khu vực này sẽ hiển thị mã đơn, sản phẩm, ngày mua,
                  giá trị và trạng thái khi được kết nối với dữ liệu
                  đơn hàng.
                </p>
              </div>

              {/* CUSTOMER SEGMENT INFORMATION */}

              <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#65D928]/20 bg-[#65D928]/5 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#65D928]/20 bg-[#65D928]/10 text-[#8BE85A]">
                  <Crown size={17} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    Phân loại khách hàng
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Khách hàng thuộc nhóm{" "}
                    <span className="font-semibold text-[#8BE85A]">
                      {segmentText[customer.segment]}
                    </span>
                    . Các quy tắc phân nhóm tự động sẽ được bổ sung
                    khi triển khai nghiệp vụ.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   EMPTY STATE ICON
===================================================== */

function UsersFallback() {
  return <ShoppingBag size={21} />;
}