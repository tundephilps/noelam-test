'use client';

import Link from 'next/link';
import { ArrowRightIcon, UsersIcon } from 'lucide-react';

import { pluralize } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Class } from '@/types/api';

export function ClassCard({
  schoolClass,
  selected = false,
}: {
  schoolClass: Class;
  selected?: boolean;
}) {
  const count = schoolClass.studentIds.length;

  return (
    <Link
      href={`/classes/${schoolClass.id}`}
      className={cn(
        'group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all outline-none hover:-translate-y-0.5 hover:shadow-md hover:shadow-foreground/5 focus-visible:ring-3 focus-visible:ring-ring/40',
        selected ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-tight">
            {schoolClass.name}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {schoolClass.id}
          </p>
        </div>

        {selected ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-medium text-primary">
            Current
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <UsersIcon aria-hidden="true" className="size-4" />
          {count === 0 ? 'No students' : pluralize(count, 'student')}
        </span>

        <span className="inline-flex items-center gap-1 font-medium text-primary">
          View roster
          <ArrowRightIcon
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
