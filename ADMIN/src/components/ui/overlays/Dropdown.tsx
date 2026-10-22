/**
 * Dropdown
 * --------
 * Menu thả xuống. Click ngoài để đóng.
 * Đi kèm DropdownItem và DropdownDivider.
 *
 * @example
 * <Dropdown trigger={<button>Menu</button>}>
 *   <DropdownItem icon={<User />}>Profile</DropdownItem>
 *   <DropdownDivider />
 *   <DropdownItem danger icon={<LogOut />}>Logout</DropdownItem>
 * </Dropdown>
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../../utils/cn';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export default function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-2 min-w-45 py-1.5 z-50',
            'bg-bg-elevated border border-border-default rounded-btn shadow-xl',
            'animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  icon,
  danger,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
        danger
          ? 'text-status-danger hover:bg-status-danger/10'
          : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1.5 h-px bg-border-default" />;
}