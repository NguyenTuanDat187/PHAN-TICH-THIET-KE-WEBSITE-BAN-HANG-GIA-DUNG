
import { useEffect, useState, type FormEvent } from 'react';

import Modal from '../../../components/ui/overlays/Modal';
import { Button } from '../../../components/ui/buttons/Button';

import type {
  AnnouncementFormValues,
  AnnouncementTargetType,
  AnnouncementView,
} from '../../../types/announcement.types';

interface AnnouncementFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
  announcement?: AnnouncementView | null;
}

const EMPTY_FORM: AnnouncementFormValues = {
  title: '',
  content: '',
  action_url: '',
  type: 'general',
  priority: 'normal',
  starts_at: '',
  expires_at: '',
  is_active: true,
  targets: [],
};

const TARGET_OPTIONS: {
  value: AnnouncementTargetType;
  label: string;
}[] = [
  { value: 'category', label: 'Danh mục' },
  { value: 'product', label: 'Sản phẩm' },
  { value: 'coupon', label: 'Mã giảm giá' },
];

function toDateTimeLocal(value: string | null) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 16);
}

export default function AnnouncementFormModal({
  open,
  onClose,
  onSubmit,
  announcement,
}: AnnouncementFormModalProps) {
  const [form, setForm] = useState<AnnouncementFormValues>(EMPTY_FORM);
  const [targetType, setTargetType] =
    useState<AnnouncementTargetType>('category');
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    if (!open) return;

    if (announcement) {
      setForm({
        title: announcement.title,
        content: announcement.content,
        action_url: announcement.action_url ?? '',
        type: announcement.type,
        priority: announcement.priority,
        starts_at: toDateTimeLocal(announcement.starts_at),
        expires_at: toDateTimeLocal(announcement.expires_at),
        is_active: announcement.is_active,
        targets: announcement.targets.map((target) => ({
          target_type: target.target_type,
          target_id: target.target_id,
          target_name: target.target_name,
        })),
      });
    } else {
      setForm(EMPTY_FORM);
    }

    setTargetType('category');
    setTargetId('');
    setTargetName('');
  }, [open, announcement]);

  const updateField = <K extends keyof AnnouncementFormValues>(
    field: K,
    value: AnnouncementFormValues[K],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddTarget = () => {
    const id = Number(targetId);
    const name = targetName.trim();

    if (!Number.isInteger(id) || id <= 0 || !name) return;

    const alreadyExists = form.targets.some(
      (target) =>
        target.target_type === targetType && target.target_id === id,
    );

    if (alreadyExists) return;

    updateField('targets', [
      ...form.targets,
      {
        target_type: targetType,
        target_id: id,
        target_name: name,
      },
    ]);

    setTargetId('');
    setTargetName('');
  };

  const handleRemoveTarget = (
    targetTypeToRemove: AnnouncementTargetType,
    targetIdToRemove: number,
  ) => {
    updateField(
      'targets',
      form.targets.filter(
        (target) =>
          !(
            target.target_type === targetTypeToRemove &&
            target.target_id === targetIdToRemove
          ),
      ),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) return;

    if (
      form.starts_at &&
      form.expires_at &&
      new Date(form.expires_at) < new Date(form.starts_at)
    ) {
      return;
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
      action_url: form.action_url.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={announcement ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Tiêu đề <span className="text-status-danger">*</span>
            </label>
            <input
              required
              maxLength={255}
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              placeholder="Nhập tiêu đề thông báo"
              className="w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Nội dung <span className="text-status-danger">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={form.content}
              onChange={(event) => updateField('content', event.target.value)}
              placeholder="Nhập nội dung thông báo..."
              className="w-full resize-y rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Đường dẫn hành động
            </label>
            <input
              value={form.action_url}
              onChange={(event) =>
                updateField('action_url', event.target.value)
              }
              placeholder="/products hoặc https://..."
              className="w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Loại thông báo
              </label>
              <select
                value={form.type}
                onChange={(event) =>
                  updateField(
                    'type',
                    event.target.value as AnnouncementFormValues['type'],
                  )
                }
                className="w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
              >
                <option value="promotion">Khuyến mãi</option>
                <option value="policy">Chính sách</option>
                <option value="maintenance">Bảo trì</option>
                <option value="general">Thông báo chung</option>
                <option value="system">Hệ thống</option>
                <option value="new_arrival">Sản phẩm mới</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Mức ưu tiên
              </label>
              <select
                value={form.priority}
                onChange={(event) =>
                  updateField(
                    'priority',
                    event.target.value as AnnouncementFormValues['priority'],
                  )
                }
                className="w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
              >
                <option value="low">Thấp</option>
                <option value="normal">Bình thường</option>
                <option value="high">Cao</option>
                <option value="urgent">Khẩn cấp</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Ngày bắt đầu
              </label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) =>
                  updateField('starts_at', event.target.value)
                }
                className="w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Ngày kết thúc
              </label>
              <input
                type="datetime-local"
                min={form.starts_at || undefined}
                value={form.expires_at}
                onChange={(event) =>
                  updateField('expires_at', event.target.value)
                }
                className="w-full rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-default bg-bg-app p-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) =>
                updateField('is_active', event.target.checked)
              }
              className="size-4 accent-[var(--color-accent-primary)]"
            />
            <span>
              <span className="block text-sm font-medium text-text-primary">
                Kích hoạt thông báo
              </span>
              <span className="mt-1 block text-xs text-text-muted">
                Bật hoặc tắt trạng thái hoạt động của thông báo.
              </span>
            </span>
          </label>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Đối tượng nhận
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                Thêm mã đối tượng và tên hiển thị. Đây là dữ liệu mock, chưa tra cứu từ database.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={targetType}
                onChange={(event) =>
                  setTargetType(
                    event.target.value as AnnouncementTargetType,
                  )
                }
                className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none"
              >
                {TARGET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={1}
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
                placeholder="ID đối tượng"
                className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />

              <input
                value={targetName}
                onChange={(event) => setTargetName(event.target.value)}
                placeholder="Tên đối tượng"
                className="rounded-lg border border-border-default bg-bg-app px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTarget}
              disabled={
                !targetId ||
                Number(targetId) <= 0 ||
                !targetName.trim()
              }
            >
              Thêm đối tượng
            </Button>

            {form.targets.length > 0 && (
              <div className="space-y-2">
                {form.targets.map((target) => (
                  <div
                    key={`${target.target_type}-${target.target_id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border-default px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text-primary">
                        {target.target_name}
                      </p>
                      <p className="text-xs text-text-muted">
                        {TARGET_OPTIONS.find(
                          (option) => option.value === target.target_type,
                        )?.label}{' '}
                        · ID {target.target_id}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveTarget(
                          target.target_type,
                          target.target_id,
                        )
                      }
                      className="shrink-0 text-xs text-status-danger hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border-default pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">
            {announcement ? 'Lưu thay đổi' : 'Tạo thông báo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
