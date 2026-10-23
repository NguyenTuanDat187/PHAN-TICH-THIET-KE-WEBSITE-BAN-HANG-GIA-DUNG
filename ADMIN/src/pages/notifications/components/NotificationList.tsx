
import {
  Bell,
  Check,
  CreditCard,
  MessageCircle,
  Package,
  ShoppingBag,
  Star,
  Tag,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import type {
  NotificationType,
  NotificationView,
} from '../../../types/notification.types';

interface NotificationListProps {
  notifications: NotificationView[];
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onOpen: (notification: NotificationView) => void;
}

const typeConfig: Record<
  NotificationType,
  { label: string; icon: LucideIcon; color: string }
> = {
  order: {
    label: 'Đơn hàng',
    icon: ShoppingBag,
    color: 'text-sky-400 bg-sky-400/10',
  },
  payment: {
    label: 'Thanh toán',
    icon: CreditCard,
    color: 'text-purple-400 bg-purple-400/10',
  },
  review: {
    label: 'Đánh giá',
    icon: Star,
    color: 'text-amber-400 bg-amber-400/10',
  },
  chat: {
    label: 'Tin nhắn',
    icon: MessageCircle,
    color: 'text-cyan-400 bg-cyan-400/10',
  },
  account: {
    label: 'Tài khoản',
    icon: UserRound,
    color: 'text-indigo-400 bg-indigo-400/10',
  },
  stock: {
    label: 'Tồn kho',
    icon: Package,
    color: 'text-rose-400 bg-rose-400/10',
  },
  promotion: {
    label: 'Khuyến mãi',
    icon: Tag,
    color: 'text-accent-primary bg-accent-primary/10',
  },
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function NotificationList({
  notifications,
  onMarkRead,
  onDelete,
  onOpen,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-border-default bg-bg-surface px-6 py-12 text-center">
        <Bell size={36} className="text-text-muted" />
        <h3 className="mt-4 font-medium text-text-primary">
          Không có thông báo
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
      {notifications.map((notification, index) => {
        const config = typeConfig[notification.type];
        const Icon = config.icon;

        return (
          <article
            key={notification.id}
            className={`flex gap-3 p-4 transition-colors hover:bg-bg-hover sm:gap-4 ${
              index !== notifications.length - 1
                ? 'border-b border-border-default'
                : ''
            } ${
              !notification.is_read ? 'bg-accent-primary/[0.035]' : ''
            }`}
          >
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}
            >
              <Icon size={19} />
            </div>

            <button
              type="button"
              onClick={() => onOpen(notification)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-sm ${
                    notification.is_read
                      ? 'font-medium text-text-primary'
                      : 'font-semibold text-text-primary'
                  }`}
                >
                  {notification.title}
                </h3>

                {!notification.is_read && (
                  <span
                    className="size-2 shrink-0 rounded-full bg-accent-primary"
                    aria-label="Chưa đọc"
                  />
                )}
              </div>

              {notification.content && (
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary">
                  {notification.content}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                <span>{config.label}</span>
                <span>{formatDate(notification.created_at)}</span>
                {notification.sender_name && (
                  <span>Người gửi: {notification.sender_name}</span>
                )}
              </div>
            </button>

            <div className="flex shrink-0 items-start gap-1">
              {!notification.is_read && (
                <button
                  type="button"
                  onClick={() => onMarkRead(notification.id)}
                  title="Đánh dấu đã đọc"
                  aria-label={`Đánh dấu đã đọc: ${notification.title}`}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-elevated hover:text-accent-primary"
                >
                  <Check size={17} />
                </button>
              )}

              <button
                type="button"
                onClick={() => onDelete(notification.id)}
                title="Xóa thông báo"
                aria-label={`Xóa thông báo: ${notification.title}`}
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-status-danger/10 hover:text-status-danger"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
