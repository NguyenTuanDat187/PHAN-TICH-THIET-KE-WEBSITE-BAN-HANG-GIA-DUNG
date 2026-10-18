import {
  LayoutDashboard, Package, Tags, ShoppingBag, Users,
  Ticket, Star, Warehouse, ChevronLeft, Store,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/brands', label: 'Brands', icon: Store },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/coupons', label: 'Coupons', icon: Ticket },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
];

export default function Sidebar() {
  return (
    <aside className="w-sidebar h-screen bg-bg-sidebar border-r border-border-default flex flex-col shrink-0">

      {/* Logo */}
      <div className="h-header flex items-center gap-3 px-6 border-b border-border-default">
        <div className="w-9 h-9 rounded-btn bg-accent-primary flex items-center justify-center">
          <span className="text-black font-bold text-lg">A</span>
        </div>
        <div>
          <p className="text-text-primary font-semibold text-sm leading-tight">Admin</p>
          <p className="text-text-muted text-xs leading-tight">Commerce</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 h-11 px-3 rounded-btn text-sm font-medium',
                'transition-all duration-app ease-app',
                isActive
                  ? 'bg-bg-selected text-text-primary'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              )
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border-default">
        <button className={cn(
          'flex items-center gap-3 h-11 px-3 w-full rounded-btn',
          'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
          'transition-all duration-app ease-app text-sm'
        )}>
          <ChevronLeft size={18} />
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  );
}