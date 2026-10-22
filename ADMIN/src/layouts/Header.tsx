import { Search, Bell, Plus, LogOut,LogIn, User as UserIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/buttons/Button';
import { cn } from '../utils/cn';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    navigate('/login', { replace: true });
  };

  return (
    <header className={cn(
      'h-header border-b border-border-default bg-bg-app',
      'flex items-center justify-between px-6 lg:px-8 gap-4'
    )}>
      <div className="min-w-0">
        <h1 className="text-text-primary text-xl font-semibold truncate">{title}</h1>
        {subtitle && <p className="text-text-muted text-xs mt-0.5 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Search..."
            className={cn(
              'w-64 h-10 pl-10 pr-4 rounded-btn',
              'bg-bg-elevated border border-border-strong',
              'text-text-primary text-sm placeholder:text-text-muted',
              'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary',
              'transition-all duration-app'
            )}
          />
        </div>

        <button className={cn(
          'relative inline-flex items-center justify-center w-10 h-10 rounded-btn',
          'bg-transparent text-text-secondary',
          'hover:bg-bg-hover hover:text-text-primary active:translate-y-px',
          'transition-all duration-app'
        )}>
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent-primary" />
        </button>

     <Button>
  <Plus size={16} />
  <span className="hidden sm:inline">Create</span>
</Button>

{/* Nút Đăng nhập nhanh — chỉ hiện khi chưa auth thật */}
<Button variant="secondary" onClick={() => navigate('/login')}>
  <LogIn size={16} />
  <span className="hidden sm:inline">Đăng nhập</span>
</Button>
        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              'w-10 h-10 rounded-full bg-bg-elevated border border-border-strong',
              'flex items-center justify-center text-text-primary font-semibold text-sm',
              'hover:border-text-muted transition-all duration-app',
              'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-app'
            )}
          >
            A
          </button>

          {menuOpen && (
            <div className={cn(
              'absolute right-0 top-12 w-56 py-1.5 rounded-btn z-50',
              'bg-bg-elevated border border-border-default shadow-xl'
            )}>
              <div className="px-3 py-2 border-b border-border-default">
                <p className="text-text-primary text-sm font-medium truncate">Admin</p>
                <p className="text-text-muted text-xs truncate">admin@shop.com</p>
              </div>
              <button className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary',
                'hover:bg-bg-hover hover:text-text-primary transition-colors'
              )}>
                <UserIcon size={16} />
                Hồ sơ cá nhân
              </button>
              <button
                onClick={handleLogout}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-status-danger',
                  'hover:bg-status-danger/10 transition-colors'
                )}
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}