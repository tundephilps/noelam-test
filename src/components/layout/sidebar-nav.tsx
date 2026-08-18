'use client';

import Link from 'next/link';
import { GraduationCapIcon, PanelLeftCloseIcon, XIcon } from 'lucide-react';

import { NAV_ITEMS, isNavItemActive } from '@/components/layout/nav-items';
import { SelectedClassCard } from '@/components/layout/selected-class-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarNavProps {
  pathname: string;
  collapsed?: boolean;
  /** Rendered in the header: collapse control on desktop, close on mobile. */
  onCollapse?: () => void;
  onClose?: () => void;
  closeButtonRef?: React.Ref<HTMLButtonElement>;
}

/**
 * The navigation pane itself. Shared by the fixed desktop sidebar and the
 * mobile drawer so both can never drift apart.
 */
export function SidebarNav({
  pathname,
  collapsed = false,
  onCollapse,
  onClose,
  closeButtonRef,
}: SidebarNavProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4',
          collapsed && 'justify-center px-2'
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCapIcon aria-hidden="true" className="size-4.5" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight">
                Northgate
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                School administration
              </span>
            </span>
          )}
        </Link>

        {onClose ? (
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={onClose}
          >
            <XIcon aria-hidden="true" />
            <span className="sr-only">Close navigation</span>
          </Button>
        ) : null}

        {onCollapse && !collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            onClick={onCollapse}
            title="Collapse navigation"
          >
            <PanelLeftCloseIcon aria-hidden="true" />
            <span className="sr-only">Collapse navigation</span>
          </Button>
        ) : null}
      </div>

      <nav
        aria-label="Main"
        className={cn('flex-1 overflow-y-auto p-3', collapsed && 'px-2')}
      >
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    collapsed && 'justify-center px-0 py-2.5',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  )}
                >
                  {/* Active marker: colour alone should not carry the state. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-0 h-5 w-1 rounded-r-full bg-sidebar-primary transition-opacity',
                      active ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Icon aria-hidden="true" className="size-4.5 shrink-0" />
                  {collapsed ? (
                    <span className="sr-only">{item.label}</span>
                  ) : (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed ? (
        <div className="border-t border-sidebar-border p-3">
          <SelectedClassCard />
        </div>
      ) : null}
    </div>
  );
}
