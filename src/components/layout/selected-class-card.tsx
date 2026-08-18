'use client';

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { useClasses } from '@/hooks/queries/use-classes';
import { useSelectedClass } from '@/hooks/use-selected-class';
import { pluralize } from '@/lib/format';

/**
 * Footer of the navigation pane: a shortcut back to the class the
 * administrator was last working in (persisted across reloads).
 */
export function SelectedClassCard() {
  const { selectedClassId } = useSelectedClass();
  const { data: classes } = useClasses();

  const selected = selectedClassId
    ? classes?.find((item) => item.id === selectedClassId)
    : undefined;

  if (!selected) {
    return (
      <Link
        href="/classes"
        className="block rounded-lg border border-dashed border-sidebar-border p-3 text-xs text-muted-foreground transition-colors hover:border-sidebar-primary/40 hover:text-foreground"
      >
        No class selected yet.
        <span className="mt-0.5 flex items-center gap-1 font-medium text-foreground">
          Browse classes
          <ArrowRightIcon aria-hidden="true" className="size-3" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/classes/${selected.id}`}
      className="block rounded-lg bg-sidebar-accent/60 p-3 transition-colors hover:bg-sidebar-accent"
    >
      <span className="block text-[0.7rem] font-medium tracking-wide text-muted-foreground uppercase">
        Current class
      </span>
      <span className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold">{selected.name}</span>
        <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" />
      </span>
      <span className="block text-xs text-muted-foreground">
        {pluralize(selected.studentIds.length, 'student')}
      </span>
    </Link>
  );
}
