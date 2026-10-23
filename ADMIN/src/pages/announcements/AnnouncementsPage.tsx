
import { useMemo, useState } from 'react';
import {
  BellRing,
  Eye,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react';

import Modal from '../../components/ui/overlays/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import AnnouncementFormModal from './components/AnnouncementFormModal';

import { announcementsMock } from '../../mocks/announcements.mock';

import type {
  AnnouncementFormValues,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementType,
  AnnouncementView,
} from '../../types/announcement.types';

const typeLabels: Record<AnnouncementType, string> = {
  promotion: 'Khuyến mãi',
  policy: 'Chính sách',
  maintenance: 'Bảo trì',
  general: 'Thông báo chung',
  system: 'Hệ thống',
  new_arrival: 'Sản phẩm mới',
};

const priorityLabels: Record<AnnouncementPriority, string> = {
  low: 'Thấp',
  normal: 'Bình thường',
  high: 'Cao',
  urgent: 'Khẩn cấp',
};

const priorityVariants: Record<
  AnnouncementPriority,
  'neutral' | 'info' | 'warning' | 'danger'
> = {
  low: 'neutral',
  normal: 'info',
  high: 'warning',
  urgent: 'danger',
};

const statusLabels: Record<AnnouncementStatus, string> = {
  draft: 'Bản nháp',
  scheduled: 'Đã lên lịch',
  published: 'Đã xuất bản',
  expired: 'Đã hết hạn',
};

const statusVariants: Record<
  AnnouncementStatus,
  'neutral' | 'info' | 'success' | 'warning'
> = {
  draft: 'neutral',
  scheduled: 'info',
  published: 'success',
  expired: 'warning',
};

type StatusFilter = 'all' | AnnouncementStatus;

function formatDate(value: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getAnnouncementStatus(
  announcement: AnnouncementView,
): AnnouncementStatus {
  if (!announcement.is_active) return 'draft';

  const now = Date.now();
  const start = announcement.starts_at
    ? new Date(announcement.starts_at).getTime()
    : null;
  const end = announcement.expires_at
    ? new Date(announcement.expires_at).getTime()
    : null;

  if (end !== null && !Number.isNaN(end) && end < now) {
    return 'expired';
  }

  if (!announcement.published_at) {
    return start !== null && !Number.isNaN(start) && start > now
      ? 'scheduled'
      : 'draft';
  }

  if (start !== null && !Number.isNaN(start) && start > now) {
    return 'scheduled';
  }

  return 'published';
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] =
    useState<AnnouncementView[]>(() =>
      announcementsMock.map((item) => ({
        ...item,
        status: getAnnouncementStatus(item),
      })),
    );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | AnnouncementType>(
    'all',
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementView | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] =
    useState<AnnouncementView | null>(null);

  const stats = useMemo(() => {
    const statuses = announcements.map(getAnnouncementStatus);

    return {
      total: announcements.length,
      published: statuses.filter((status) => status === 'published').length,
      scheduled: statuses.filter((status) => status === 'scheduled').length,
      draft: statuses.filter((status) => status === 'draft').length,
    };
  }, [announcements]);

  const filteredAnnouncements = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return announcements
      .filter((announcement) => {
        const matchesSearch =
          !keyword ||
          announcement.title.toLowerCase().includes(keyword) ||
          announcement.content.toLowerCase().includes(keyword) ||
          announcement.created_by_name.toLowerCase().includes(keyword);

        const status = getAnnouncementStatus(announcement);
        const matchesStatus =
          statusFilter === 'all' || status === statusFilter;

        const matchesType =
          typeFilter === 'all' || announcement.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime(),
      );
  }, [announcements, search, statusFilter, typeFilter]);

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setFormOpen(true);
  };

  const openEditModal = (announcement: AnnouncementView) => {
    setEditingAnnouncement(announcement);
    setFormOpen(true);
  };

  const handleSave = (values: AnnouncementFormValues) => {
    const now = new Date().toISOString();

    if (editingAnnouncement) {
      setAnnouncements((current) =>
        current.map((item) => {
          if (item.id !== editingAnnouncement.id) return item;

          const updated: AnnouncementView = {
            ...item,
            title: values.title,
            content: values.content,
            action_url: values.action_url || null,
            type: values.type,
            priority: values.priority,
            starts_at: values.starts_at
              ? new Date(values.starts_at).toISOString()
              : null,
            expires_at: values.expires_at
              ? new Date(values.expires_at).toISOString()
              : null,
            is_active: values.is_active,
            updated_at: now,
            targets: values.targets.map((target, index) => ({
              id: index + 1,
              announcement_id: item.id,
              target_type: target.target_type,
              target_id: target.target_id,
              target_name: target.target_name,
              created_at: now,
            })),
          };

          return { ...updated, status: getAnnouncementStatus(updated) };
        }),
      );
    } else {
      const nextId =
        announcements.reduce((max, item) => Math.max(max, item.id), 0) + 1;

      const created: AnnouncementView = {
        id: nextId,
        created_by: 1,
        title: values.title,
        content: values.content,
        action_url: values.action_url || null,
        type: values.type,
        priority: values.priority,
        starts_at: values.starts_at
          ? new Date(values.starts_at).toISOString()
          : null,
        expires_at: values.expires_at
          ? new Date(values.expires_at).toISOString()
          : null,
        published_at: null,
        is_active: values.is_active,
        created_at: now,
        updated_at: now,
        created_by_name: 'Admin',
        total_recipients: 0,
        total_read: 0,
        status: 'draft',
        targets: values.targets.map((target, index) => ({
          id: index + 1,
          announcement_id: nextId,
          target_type: target.target_type,
          target_id: target.target_id,
          target_name: target.target_name,
          created_at: now,
        })),
      };

      created.status = getAnnouncementStatus(created);

      setAnnouncements((current) => [created, ...current]);
    }

    setFormOpen(false);
    setEditingAnnouncement(null);
  };

  const handleDelete = (announcement: AnnouncementView) => {
    const confirmed = window.confirm(
      `Mày có chắc muốn xóa thông báo "${announcement.title}" không?`,
    );

    if (!confirmed) return;

    setAnnouncements((current) =>
      current.filter((item) => item.id !== announcement.id),
    );

    if (viewingAnnouncement?.id === announcement.id) {
      setViewingAnnouncement(null);
    }
  };

  const handlePublish = (announcement: AnnouncementView) => {
    const confirmed = window.confirm(
      `Xuất bản thông báo "${announcement.title}"?`,
    );

    if (!confirmed) return;

    const now = new Date().toISOString();

    setAnnouncements((current) =>
      current.map((item) => {
        if (item.id !== announcement.id) return item;

        const updated: AnnouncementView = {
          ...item,
          is_active: true,
          published_at: now,
          updated_at: now,
        };

        return { ...updated, status: getAnnouncementStatus(updated) };
      }),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-primary/10 text-accent-primary">
            <BellRing size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Quản lý thông báo
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Tạo và quản lý thông báo gửi đến khách hàng.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
        >
          <Plus size={17} />
          Tạo thông báo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Tổng thông báo</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Đã xuất bản</p>
          <p className="mt-2 text-2xl font-semibold text-accent-primary">
            {stats.published}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Đã lên lịch</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.scheduled}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <p className="text-sm text-text-secondary">Bản nháp</p>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {stats.draft}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border-default bg-bg-surface p-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-default bg-bg-app px-3">
          <Search size={17} className="shrink-0 text-text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung, người tạo..."
            aria-label="Tìm thông báo"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          aria-label="Lọc trạng thái thông báo"
          className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="scheduled">Đã lên lịch</option>
          <option value="published">Đã xuất bản</option>
          <option value="expired">Đã hết hạn</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as 'all' | AnnouncementType)
          }
          aria-label="Lọc loại thông báo"
          className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
        >
          <option value="all">Tất cả loại</option>
          {(Object.keys(typeLabels) as AnnouncementType[]).map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border-default bg-bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border-default p-4">
          <h2 className="font-semibold text-text-primary">
            Danh sách thông báo
          </h2>
          <span className="text-sm text-text-muted">
            {filteredAnnouncements.length} kết quả
          </span>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <BellRing size={34} className="mx-auto text-text-muted" />
            <p className="mt-3 font-medium text-text-primary">
              Không tìm thấy thông báo
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Thử thay đổi từ khóa hoặc bộ lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-bg-app/70">
                <tr className="border-b border-border-default text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Thông báo</th>
                  <th className="px-4 py-3 font-medium">Loại</th>
                  <th className="px-4 py-3 font-medium">Ưu tiên</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Lượt đọc</th>
                  <th className="px-4 py-3 font-medium">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredAnnouncements.map((announcement) => {
                  const status = getAnnouncementStatus(announcement);
                  const readRate =
                    announcement.total_recipients > 0
                      ? Math.round(
                          (announcement.total_read /
                            announcement.total_recipients) *
                            100,
                        )
                      : 0;

                  return (
                    <tr
                      key={announcement.id}
                      className="border-b border-border-default last:border-b-0 hover:bg-bg-hover/50"
                    >
                      <td className="max-w-[320px] px-4 py-4">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {announcement.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                          {announcement.content}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          Người tạo: {announcement.created_by_name}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-text-secondary">
                        {typeLabels[announcement.type]}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={priorityLabels[announcement.priority]}
                          variant={priorityVariants[announcement.priority]}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={statusLabels[status]}
                          variant={statusVariants[status]}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-text-primary">
                          {announcement.total_read.toLocaleString('vi-VN')}
                          {' / '}
                          {announcement.total_recipients.toLocaleString('vi-VN')}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {readRate}% đã đọc
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-text-secondary">
                        {formatDate(announcement.starts_at)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            title="Xem chi tiết"
                            aria-label="Xem chi tiết thông báo"
                            onClick={() =>
                              setViewingAnnouncement(announcement)
                            }
                            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Chỉnh sửa"
                            aria-label="Chỉnh sửa thông báo"
                            onClick={() => openEditModal(announcement)}
                            className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-accent-primary"
                          >
                            <Pencil size={16} />
                          </button>

                          {status !== 'published' && status !== 'expired' && (
                            <button
                              type="button"
                              title="Xuất bản"
                              aria-label="Xuất bản thông báo"
                              onClick={() => handlePublish(announcement)}
                              className="rounded-lg p-2 text-text-muted hover:bg-bg-elevated hover:text-accent-primary"
                            >
                              <Send size={16} />
                            </button>
                          )}

                          <button
                            type="button"
                            title="Xóa"
                            aria-label="Xóa thông báo"
                            onClick={() => handleDelete(announcement)}
                            className="rounded-lg p-2 text-text-muted hover:bg-status-danger/10 hover:text-status-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / edit modal */}
      <AnnouncementFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleSave}
        announcement={editingAnnouncement}
      />

      {/* Detail modal */}
      <Modal
        open={Boolean(viewingAnnouncement)}
        onClose={() => setViewingAnnouncement(null)}
        title="Chi tiết thông báo"
        maxWidth="lg"
      >
        {viewingAnnouncement && (
          <div className="max-h-[70vh] space-y-5 overflow-y-auto">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  status={typeLabels[viewingAnnouncement.type]}
                  variant="info"
                />
                <StatusBadge
                  status={
                    priorityLabels[viewingAnnouncement.priority]
                  }
                  variant={priorityVariants[viewingAnnouncement.priority]}
                />
                <StatusBadge
                  status={
                    statusLabels[getAnnouncementStatus(viewingAnnouncement)]
                  }
                  variant={
                    statusVariants[getAnnouncementStatus(viewingAnnouncement)]
                  }
                />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                {viewingAnnouncement.title}
              </h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                {viewingAnnouncement.content}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border-default p-3">
                <p className="text-xs text-text-muted">Người tạo</p>
                <p className="mt-1 text-sm text-text-primary">
                  {viewingAnnouncement.created_by_name}
                </p>
              </div>
              <div className="rounded-lg border border-border-default p-3">
                <p className="text-xs text-text-muted">Ngày xuất bản</p>
                <p className="mt-1 text-sm text-text-primary">
                  {formatDate(viewingAnnouncement.published_at)}
                </p>
              </div>
              <div className="rounded-lg border border-border-default p-3">
                <p className="text-xs text-text-muted">Ngày bắt đầu</p>
                <p className="mt-1 text-sm text-text-primary">
                  {formatDate(viewingAnnouncement.starts_at)}
                </p>
              </div>
              <div className="rounded-lg border border-border-default p-3">
                <p className="text-xs text-text-muted">Ngày kết thúc</p>
                <p className="mt-1 text-sm text-text-primary">
                  {formatDate(viewingAnnouncement.expires_at)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-primary">
                Đối tượng nhận
              </h4>

              {viewingAnnouncement.targets.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">
                  Chưa cấu hình đối tượng cụ thể.
                </p>
              ) : (
                <div className="mt-2 space-y-2">
                  {viewingAnnouncement.targets.map((target) => (
                    <div
                      key={target.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border-default px-3 py-2"
                    >
                      <span className="text-sm text-text-primary">
                        {target.target_name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {target.target_type} · ID {target.target_id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {viewingAnnouncement.action_url && (
              <div>
                <p className="text-xs text-text-muted">Đường dẫn hành động</p>
                <p className="mt-1 break-all text-sm text-text-primary">
                  {viewingAnnouncement.action_url}
                </p>
              </div>
            )}

            <div className="flex justify-end border-t border-border-default pt-4">
              <button
                type="button"
                onClick={() => {
                  setViewingAnnouncement(null);
                  openEditModal(viewingAnnouncement);
                }}
                className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
