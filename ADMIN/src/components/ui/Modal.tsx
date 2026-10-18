/**
 * Modal
 * -----
 * Hộp thoại trung tâm. Đóng khi click backdrop, nhấn ESC, hoặc nút X.
 *
 * @example
 * <Modal open={open} onClose={close} title="Xác nhận">
 *   Bạn có chắc muốn xoá?
 * </Modal>
 */
import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export default function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-bg-surface border border-border-default rounded-card shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-150',
          widthMap[maxWidth]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h2 className="text-text-primary font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className={cn(
                'w-8 h-8 rounded-btn flex items-center justify-center',
                'text-text-muted hover:bg-bg-hover hover:text-text-primary',
                'transition-colors duration-app'
              )}
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}