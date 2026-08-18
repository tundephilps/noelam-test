'use client';

import { RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';

import { Spinner } from '@/components/common/spinner';
import { Button } from '@/components/ui/button';
import { ApiError, toApiError } from '@/lib/api-error';
import { cn } from '@/lib/utils';

/**
 * The three async states every data surface in the app needs. Kept in one file
 * so loading, error and empty always look and behave the same way.
 */

export function LoadingPanel({
  label = 'Loading…',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-sm text-muted-foreground',
        className
      )}
    >
      <Spinner className="size-6 text-primary" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorPanel({
  error,
  onRetry,
  title = 'Something went wrong',
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const apiError: ApiError = toApiError(error);

  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        className
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon aria-hidden="true" className="size-5" />
      </span>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{apiError.message}</p>
        {apiError.status ? (
          <p className="text-xs text-muted-foreground/80">
            Request failed with status {apiError.status}
          </p>
        ) : null}
      </div>

      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyPanel({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        className
      )}
    >
      {Icon ? (
        <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon aria-hidden className="size-5" />
        </span>
      ) : null}

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}
