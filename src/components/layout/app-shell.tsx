'use client';

import { MenuIcon, PanelLeftOpenIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Button } from '@/components/ui/button';
import { sidebarCollapsedStore } from '@/lib/ui-stores';
import { cn } from '@/lib/utils';

/**
 * Application chrome: a fixed navigation pane on desktop, an overlay drawer on
 * small screens, and the scrolling content region.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const collapsed = useSyncExternalStore(
    sidebarCollapsedStore.subscribe,
    sidebarCollapsedStore.getSnapshot,
    sidebarCollapsedStore.getServerSnapshot
  );

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  // Navigating from the drawer dismisses it. Adjusted during render so the
  // drawer never paints once over the page it just navigated to.
  const [pathnameWhenOpened, setPathnameWhenOpened] = useState(pathname);

  if (pathnameWhenOpened !== pathname) {
    setPathnameWhenOpened(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  // While the drawer is open: lock the page behind it, close on Escape, and
  // move focus into the drawer. Focus returns to the trigger on close.
  useEffect(() => {
    if (!mobileOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const trigger = menuButtonRef.current;

    body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    drawerCloseRef.current?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    sidebarCollapsedStore.set(!collapsed);
  }

  return (
    <div
      className="min-h-svh bg-background"
      style={
        { '--sidebar-width': collapsed ? '4.5rem' : '16rem' } as React.CSSProperties
      }
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-110 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop navigation pane */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-(--sidebar-width) border-r border-sidebar-border transition-[width] duration-200 lg:block"
      >
        <SidebarNav
          pathname={pathname}
          collapsed={collapsed}
          onCollapse={toggleCollapsed}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            tabIndex={-1}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-foreground/40 backdrop-blur-[2px] animate-in fade-in-0"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-sidebar-border shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <SidebarNav
              pathname={pathname}
              onClose={() => setMobileOpen(false)}
              closeButtonRef={drawerCloseRef}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-(--sidebar-width)">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button
            ref={menuButtonRef}
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </Button>

          {collapsed ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:inline-flex"
              onClick={toggleCollapsed}
              title="Expand navigation"
            >
              <PanelLeftOpenIcon aria-hidden="true" />
              <span className="sr-only">Expand navigation</span>
            </Button>
          ) : null}

          <p className="truncate text-sm font-medium lg:hidden">Northgate Admin</p>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
            >
              AO
            </span>
            <span className="sr-only">Signed in as Ada Okafor, administrator</span>
          </div>
        </header>

        <main
          id="main-content"
          className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8')}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
