
import { NavLink } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { navigation } from '../constants/navigation';
import { cn } from '../utils/cn';

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-sidebar shrink-0 flex-col border-r border-border-default bg-bg-sidebar">
      {/* Logo */}
      <div className="flex h-header shrink-0 items-center gap-3 border-b border-border-default px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-accent-primary">
          <span className="text-lg font-bold text-black">A</span>
        </div>

        <div>
          <p className="text-sm font-semibold leading-tight text-text-primary">
            AdminFlux
          </p>
          <p className="text-xs leading-tight text-text-muted">
            Commerce
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Điều hướng chính"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {navigation.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/admin/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-btn px-3 text-sm font-medium',
                'transition-colors duration-200',
                isActive
                  ? 'bg-bg-selected text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-default p-3">
        <button
          type="button"
          className={cn(
            'flex h-11 w-full items-center gap-3 rounded-btn px-3',
            'text-sm text-text-secondary transition-colors duration-200',
            'hover:bg-bg-hover hover:text-text-primary',
          )}
          onClick={() => {
            // TODO: Bổ sung chức năng thu gọn sidebar.
          }}
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
          <span>Thu gọn</span>
        </button>
      </div>
    </aside>
  );
}
