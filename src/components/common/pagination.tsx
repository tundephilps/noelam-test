'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { pageWindow } from '@/lib/paginate';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageCount,
  from,
  to,
  total,
  itemLabel = 'students',
  onPageChange,
}: PaginationProps) {
  if (pageCount <= 1) {
    return (
      <p className="px-4 py-3 text-xs text-muted-foreground">
        Showing {total} of {total} {itemLabel}
      </p>
    );
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p aria-live="polite" className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </Button>

        {pageWindow(page, pageCount).map((value, index) =>
          value === null ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-xs text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={value}
              variant={value === page ? 'default' : 'ghost'}
              size="icon-sm"
              aria-current={value === page ? 'page' : undefined}
              aria-label={`Page ${value}`}
              className={cn('text-xs', value === page && 'pointer-events-none')}
              onClick={() => onPageChange(value)}
            >
              {value}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </nav>
  );
}
