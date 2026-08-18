import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Student } from '@/types/api';

/**
 * Initials avatar. Decorative — the student's name is always rendered beside
 * it, so it is hidden from assistive technology.
 */
export function StudentAvatar({
  student,
  className,
}: {
  student: Pick<Student, 'firstName' | 'lastName'>;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground',
        className
      )}
    >
      {initials(student)}
    </span>
  );
}
