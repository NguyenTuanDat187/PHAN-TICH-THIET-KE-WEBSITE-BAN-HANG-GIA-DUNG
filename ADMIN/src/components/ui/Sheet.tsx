/**
 * Sheet
 * -----
 * Drawer trượt từ cạnh màn hình (giống modal nhưng dạng panel).
 * Dùng cho filter nâng cao, form edit, mobile menu.
 *
 * @example
 * <Sheet open={open} onClose={close} title="Bộ lọc" side="right">
 *   <form>...</form>
 * </Sheet>
 */
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: 'left' | 'right';
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export default function Sheet({
  open,
  onClose,
  title,
  description,
  side = 'right',
  children,
  footer,
  width = 'md',
}: SheetProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute top-0 bottom-0 w-full bg-bg-surface border-border-default flex flex-col',
          'shadow-2xl',
          side === 'right'
            ? 'right-0 border-l animate-in slide-in-from-right duration-200'
            : 'left-0 border-r animate-in slide-in-from-left duration-200',
          widthMap[width]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border-default">
          <div className="min-w-0">
            {title && <h2 className="text-text-primary font-semibold">{title}</h2>}
            {description && <p className="text-text-muted text-xs mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-btn flex items-center justify-center text-text-muted hover:bg-bg-hover hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && <div className="p-4 border-t border-border-default">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}