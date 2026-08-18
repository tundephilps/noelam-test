import Link from 'next/link';
import { ChevronLeftIcon } from 'lucide-react';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Optional "up one level" affordance, e.g. back to the class roster. */
  backHref?: string;
  backLabel?: string;
  /** Buttons or filters aligned to the end of the header row. */
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = 'Back',
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-3">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
          {backLabel}
        </Link>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
