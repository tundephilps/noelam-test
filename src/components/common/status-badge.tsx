import type { StudentStatus } from '@/types/api';
import { cn } from '@/lib/utils';

const STYLES: Record<StudentStatus, string> = {
  active: 'bg-success/10 text-success ring-success/25',
  inactive: 'bg-muted text-muted-foreground ring-border',
};

const LABELS: Record<StudentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

/**
 * Enrollment status. Carries a dot as well as colour so the state is legible
 * without relying on hue alone.
 */
export function StatusBadge({
  status,
  className,
}: {
  status: StudentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        STYLES[status],
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-1.5 rounded-full',
          status === 'active' ? 'bg-success' : 'bg-muted-foreground/60'
        )}
      />
      {LABELS[status]}
    </span>
  );
}
