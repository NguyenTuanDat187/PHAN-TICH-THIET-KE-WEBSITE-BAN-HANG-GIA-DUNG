/**
 * Command Palette
 * ---------------
 * Bảng lệnh tìm kiếm (Cmd/Ctrl + K). Dùng để search nhanh
 * sản phẩm, chuyển trang, thực thi action.
 *
 * @example
 * <Command
 *   open={open}
 *   onClose={close}
 *   groups={[
 *     { title: 'Điều hướng', items: [{ label: 'Dashboard', icon: <Home />, onSelect: () => nav('/') }] },
 *     { title: 'Sản phẩm', items: [...] },
 *   ]}
 * />
 */
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CommandItem {
  label: string;
  description?: string;
  icon?: ReactNode;
  onSelect: () => void;
}

interface CommandGroup {
  title: string;
  items: CommandItem[];
}

interface CommandProps {
  open: boolean;
  onClose: () => void;
  groups: CommandGroup[];
  placeholder?: string;
}

export default function Command({ open, onClose, groups, placeholder = 'Gõ để tìm...' }: CommandProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((i) =>
          i.label.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg rounded-card overflow-hidden',
          'bg-bg-surface border border-border-default shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-150'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border-default">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
          />
          <kbd className="hidden sm:inline-flex h-6 px-2 rounded border border-border-strong text-text-muted text-[10px] font-mono items-center">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-8">Không tìm thấy kết quả</p>
          ) : (
            filtered.map((g) => (
              <div key={g.title} className="mb-2 last:mb-0">
                <p className="px-2 py-1.5 text-text-muted text-[10px] font-semibold uppercase tracking-wider">
                  {g.title}
                </p>
                {g.items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { item.onSelect(); onClose(); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-2 py-2 rounded-btn',
                      'text-left transition-colors duration-app',
                      'hover:bg-bg-hover'
                    )}
                  >
                    {item.icon && <span className="text-text-muted shrink-0">{item.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm truncate">{item.label}</p>
                      {item.description && (
                        <p className="text-text-muted text-xs truncate">{item.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}