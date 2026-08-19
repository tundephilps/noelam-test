'use client';

import { useEffect, useState } from 'react';

import { AppBootScreen } from '@/components/layout/app-boot-screen';

type Status = 'starting' | 'ready' | 'failed';

/**
 * Starts the worker at most once per page load.
 *
 * React Strict Mode runs effects twice in development, and calling
 * `worker.start()` a second time throws ("cannot configure an already enabled
 * network") — which would drop an already-working app onto the failure screen.
 * Caching the promise at module scope makes the second call a no-op.
 */
let startPromise: Promise<unknown> | null = null;

function startMockApi(): Promise<unknown> {
  startPromise ??= import('@/mocks/browser').then(({ worker }) =>
    worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
    })
  );

  return startPromise;
}

/**
 * Boots the Mock Service Worker before anything renders.
 *
 * Every request in this app is served by the worker, so children must not
 * mount until it is listening — otherwise the first fetch of a hard reload
 * escapes to the network and 404s. Direct URL access (e.g. /students/STU-004)
 * depends on this ordering.
 */
export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('starting');

  useEffect(() => {
    let cancelled = false;

    startMockApi().then(
      () => {
        if (!cancelled) setStatus('ready');
      },
      (error: unknown) => {
        // Surfaced in the console as well as on screen: without the worker the
        // app has no API at all, so the cause needs to be findable.
        console.error('[mock api] service worker failed to start', error);

        if (!cancelled) setStatus('failed');
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'starting') {
    return <AppBootScreen state="starting" />;
  }

  if (status === 'failed') {
    return <AppBootScreen state="failed" />;
  }

  return <>{children}</>;
}
