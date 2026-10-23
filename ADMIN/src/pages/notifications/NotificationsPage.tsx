
import { useMemo, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Search,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import NotificationList from './components/NotificationList';
import { notificationsMock } from '../../mocks/notifications.mock';

import type {
  NotificationType,
  NotificationView,
} from '../../types/notification.types';

const typeLabels: Record<NotificationType, string> = {
  order: 'Đơn hàng',
  payment: 'Thanh toán',
  review: 'Đánh giá',
  chat: 'Tin nhắn',
  account: 'Tài khoản',
  stock: 'Tồn kho',
  promotion: 'Khuyến mãi',
};

type ReadFilter = 'all' | 'unread' | 'read';
type TypeFilter = 'all' | NotificationType;

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState<NotificationView[]>(notificationsMock);

  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter((item) => !item.is_read).length,
      read: notifications.filter((item) => item.is_read).length,
    }),
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return notifications
      .filter((notification) => {
        const matchesSearch =
          !keyword ||
          notification.title.toLowerCase().includes(keyword) ||
          (notification.content ?? '').toLowerCase().includes(keyword) ||
          (notification.sender_name ?? '').toLowerCase().includes(keyword);

        const matchesRead =
          readFilter === 'all' ||
          (readFilter === 'unread' && !notification.is_read) ||
          (readFilter === 'read' && notification.is_read);

        const matchesType =
          typeFilter === 'all' || notification.type === typeFilter;

        return matchesSearch && matchesRead && matchesType;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }, [notifications, search, readFilter, typeFilter]);

  const handleMarkRead = (id: number) => {
    const now = new Date().toISOString();

    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              is_read: true,
              read_at: item.read_at ?? now,
              updated_at: now,
            }
          : item,
      ),
    );
  };

  const handleMarkAllRead = () => {
    const now = new Date().toISOString();

    setNotifications((current) =>
      current.map((item) =>
        item.is_read
          ? item
          : {
              ...item,
              is_read: true,
              read_at: now,
              updated_at: now,
            },
      ),
    );
  };

  const handleDelete = (id: number) => {
    setNotifications((current) =>
      current.filter((item) => item.id !== id),
    );
  };

  const handleClearRead = () => {
    setNotifications((current) =>
      current.filter((item) => !item.is_read),
    );
  };

  const handleOpenNotification = (
    notification: NotificationView,
  ) => {
    handleMarkRead(notification.id);

    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
              <Bell size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Thông báo
              </h1>
              <p className="mt-1 text-sm text-text-secondary">
                Theo dõi hoạt động và cập nhật của cửa hàng.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={stats.unread === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={16} />
            Đánh dấu tất cả đã đọc
          </button>

          <button
            type="button"
            onClick={handleClearRead}
            disabled={stats.read === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-status-danger disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Xóa đã đọc
          </button>
        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Tổng thông báo</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Chưa đọc</p>
          <p className="mt-2 text-2xl font-semibold text-accent-primary">
            {stats.unread}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Đã đọc</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.read}
          </p>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-default bg-bg-app px-3">
          <Search size={17} className="shrink-0 text-text-muted" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tiêu đề, nội dung hoặc người gửi..."
            aria-label="Tìm kiếm thông báo"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        <select
          value={readFilter}
          onChange={(event) =>
            setReadFilter(event.target.value as ReadFilter)
          }
          aria-label="Lọc trạng thái đọc"
          className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unread">Chưa đọc</option>
          <option value="read">Đã đọc</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as TypeFilter)
          }
          aria-label="Lọc loại thông báo"
          className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
        >
          <option value="all">Tất cả loại</option>

          {(Object.keys(typeLabels) as NotificationType[]).map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-text-primary">
          Danh sách thông báo
        </h2>
        <span className="text-sm text-text-muted">
          {filteredNotifications.length} kết quả
        </span>
      </div>

      <NotificationList
        notifications={filteredNotifications}
        onMarkRead={handleMarkRead}
        onDelete={handleDelete}
        onOpen={handleOpenNotification}
      />
    </div>
  );
}
