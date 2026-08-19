'use client';

import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from 'lucide-react';
import { useId } from 'react';

import type { Class } from '@/types/api';

/**
 * Quick jump between classes.
 *
 * Deliberately a native `<select>`: it is keyboard and screen-reader correct
 * out of the box and renders as the platform picker on mobile, which beats a
 * custom listbox for a five-item switcher.
 */
export function ClassSwitcher({
  classes,
  currentClassId,
  disabled = false,
}: {
  classes: Class[];
  currentClassId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const selectId = useId();

  return (
    <div className="relative">
      <label htmlFor={selectId} className="sr-only">
        Switch class
      </label>

      <select
        id={selectId}
        value={currentClassId}
        disabled={disabled || classes.length === 0}
        onChange={(event) => router.push(`/classes/${event.target.value}`)}
        className="h-9 w-full appearance-none rounded-lg border border-input bg-card py-1 pr-8 pl-3 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-50 sm:w-44"
      >
        {classes.map((schoolClass) => (
          <option key={schoolClass.id} value={schoolClass.id}>
            {schoolClass.name} ({schoolClass.studentIds.length})
          </option>
        ))}
      </select>

      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}
