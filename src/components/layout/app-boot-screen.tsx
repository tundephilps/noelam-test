'use client';

import { GraduationCapIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common/spinner';

/**
 * Shown while the mock API worker starts, and if it fails to register.
 * Prevents the blank white flash before the app can serve any data.
 */
export function AppBootScreen({ state }: { state: 'starting' | 'failed' }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <GraduationCapIcon aria-hidden="true" className="size-6" />
      </div>

      {state === 'starting' ? (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner className="size-4" />
            <span>Starting Northgate Admin…</span>
          </div>
          <p className="sr-only" role="status">
            Loading the application
          </p>
        </>
      ) : (
        <div className="max-w-sm space-y-3">
          <h1 className="text-lg font-semibold">Could not start the mock API</h1>
          <p className="text-sm text-muted-foreground">
            The service worker failed to register, so no data can be loaded.
            Reload the page — if it keeps failing, restart the dev server so
            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">
              public/mockServiceWorker.js
            </code>
            is served again.
          </p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      )}
    </main>
  );
}
