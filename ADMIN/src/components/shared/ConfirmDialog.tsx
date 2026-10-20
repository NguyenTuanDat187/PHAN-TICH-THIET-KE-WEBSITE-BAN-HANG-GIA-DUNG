
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-2xl border border-border-default bg-bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              variant === 'danger'
                ? 'bg-status-danger/10 text-status-danger'
                : 'bg-accent-primary/10 text-accent-primary'
            }`}
          >
            <AlertTriangle size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="pr-2 text-lg font-semibold text-text-primary"
            >
              {title}
            </h2>

            <p
              id="confirm-dialog-description"
              className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary"
            >
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Đóng hộp thoại"
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-10 rounded-lg border border-border-default px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              variant === 'danger'
                ? 'bg-status-danger text-white hover:bg-status-danger/85'
                : 'bg-accent-primary text-black hover:bg-accent-hover'
            }`}
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </section>
    </div>
  );
}
