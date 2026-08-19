'use client';

import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Last-resort boundary for render-time crashes. Data-fetching failures are
 * handled in place by `ErrorPanel`, which keeps the surrounding page usable.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon aria-hidden="true" className="size-5" />
      </span>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || 'An unexpected error interrupted this page.'}
        </p>
      </div>

      <Button size="lg" onClick={reset}>
        <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
        Try again
      </Button>
    </div>
  );
}
