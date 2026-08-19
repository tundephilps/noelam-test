import type { LucideIcon } from 'lucide-react';

import { Skeleton } from '@/components/common/skeleton';
import { cn } from '@/lib/utils';

type Tone = 'primary' | 'success' | 'warning' | 'neutral';

const TONE_STYLES: Record<Tone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  neutral: 'bg-muted text-muted-foreground',
};

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
  loading?: boolean;
  /** Optional 0–1 share rendered as a thin meter under the value. */
  share?: number;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
  loading = false,
  share,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm shadow-foreground/[0.02]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            TONE_STYLES[tone]
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      )}

      {typeof share === 'number' && !loading ? (
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="presentation"
        >
          <div
            className={cn(
              'h-full rounded-full',
              tone === 'success' ? 'bg-success' : 'bg-primary'
            )}
            style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }}
          />
        </div>
      ) : null}

      {hint && !loading ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
