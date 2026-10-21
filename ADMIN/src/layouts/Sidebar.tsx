
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { Button } from '../components/ui/buttons/Button';
import type { NavigationItem } from '../constants/navigation';
import { navigation } from '../constants/navigation';
import { cn } from '../utils/cn';

function isPathActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function containsActivePath(
  item: NavigationItem,
  pathname: string,
): boolean {
  if (item.children?.length) {
    return item.children.some((child) =>
      containsActivePath(child, pathname),
    );
  }

  return isPathActive(pathname, item.path);
}

interface SidebarMenuProps {
  items: NavigationItem[];
  pathname: string;
  depth: number;
  openGroups: string[];
  toggleGroup: (id: string) => void;
}

function SidebarMenu({
  items,
  pathname,
  depth,
  openGroups,
  toggleGroup,
}: SidebarMenuProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const isOpen = openGroups.includes(item.id);
        const isActive =
          !hasChildren && pathname === item.path;
        const hasActiveChild =
          hasChildren && containsActivePath(item, pathname);

        const groupId = `sidebar-group-${item.id}`;
        const paddingLeft = 12 + depth * 12;

        if (!hasChildren) {
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end
              aria-current={isActive ? 'page' : undefined}
              className={({ isActive: routeActive }) =>
                cn(
                  'flex min-h-10 w-full items-center gap-3 rounded-btn px-3 py-2',
                  'text-sm transition-colors duration-app ease-app',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-accent-primary focus-visible:ring-offset-2',
                  'focus-visible:ring-offset-bg-sidebar',
                  routeActive
                    ? 'bg-bg-selected font-medium text-text-primary'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                )
              }
              style={{ paddingLeft }}
            >
              <Icon
                size={depth === 0 ? 18 : 16}
                strokeWidth={1.8}
                className="shrink-0"
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1 truncate">
                {item.label}
              </span>
            </NavLink>
          );
        }

        return (
          <div key={item.id} className="space-y-1">
            <Button
              type="button"
              variant="ghost"
              aria-expanded={isOpen}
              aria-controls={groupId}
              onClick={() => toggleGroup(item.id)}
              className={cn(
                'flex h-11 min-h-11 w-full items-center gap-3 rounded-btn px-3',
                'justify-start text-sm font-medium',
                'transition-colors duration-app ease-app',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-accent-primary focus-visible:ring-offset-2',
                'focus-visible:ring-offset-bg-sidebar',
                hasActiveChild
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary',
              )}
              style={{ paddingLeft }}
            >
              <Icon
                size={depth === 0 ? 18 : 16}
                strokeWidth={1.8}
                className="shrink-0"
                aria-hidden="true"
              />

              <span className="min-w-0 flex-1 truncate text-left">
                {item.label}
              </span>

              <ChevronDown
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className={cn(
                  'shrink-0 transition-transform duration-app',
                  isOpen && 'rotate-180',
                )}
              />
            </Button>

            <div id={groupId} hidden={!isOpen}>
              <div className="ml-3 border-l border-border-default pl-2">
                <SidebarMenu
                  items={item.children!}
                  pathname={pathname}
                  depth={depth + 1}
                  openGroups={openGroups}
                  toggleGroup={toggleGroup}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const { pathname } = useLocation();

  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    const activeGroupIds: string[] = [];

    const visit = (items: NavigationItem[]) => {
      for (const item of items) {
        if (!item.children?.length) {
          continue;
        }

        if (containsActivePath(item, pathname)) {
          activeGroupIds.push(item.id);
        }

        visit(item.children);
      }
    };

    visit(navigation);

    setOpenGroups((current) =>
      Array.from(new Set([...current, ...activeGroupIds])),
    );
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((current) =>
      current.includes(id)
        ? current.filter((groupId) => groupId !== id)
        : [...current, id],
    );
  };

  return (
    <aside
      aria-label="Thanh điều hướng quản trị"
      className={cn(
        'flex h-full w-sidebar shrink-0 flex-col',
        'border-r border-border-default bg-bg-sidebar',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex h-header shrink-0 items-center gap-3',
          'border-b border-border-default px-6',
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-accent-primary">
          <span className="text-lg font-bold text-black">A</span>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-text-primary">
            AdminFlux
          </p>

          <p className="mt-1 text-xs leading-tight text-text-muted">
            Commerce
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Điều hướng chính"
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-4"
      >
        <SidebarMenu
          items={navigation}
          pathname={pathname}
          depth={0}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
        />
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-border-default px-4 py-3">
        <p className="text-center text-[11px] text-text-muted">
          AdminFlux · Commerce
        </p>
      </div>
    </aside>
  );
}
