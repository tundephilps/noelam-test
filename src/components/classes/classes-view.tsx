'use client';

import { SchoolIcon } from 'lucide-react';

import { ClassCard } from '@/components/classes/class-card';
import { EmptyPanel, ErrorPanel } from '@/components/common/state-panels';
import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@/components/common/skeleton';
import { useClasses } from '@/hooks/queries/use-classes';
import { useSelectedClass } from '@/hooks/use-selected-class';
import { pluralize } from '@/lib/format';

export function ClassesView() {
  const classesQuery = useClasses();
  const { selectedClassId } = useSelectedClass();

  const classes = classesQuery.data;

  const totalEnrolled =
    classes?.reduce((sum, item) => sum + item.studentIds.length, 0) ?? 0;

  return (
    <>
      <PageHeader
        title="Classes"
        description={
          classes
            ? `${pluralize(classes.length, 'class', 'classes')} · ${pluralize(
                totalEnrolled,
                'enrolment'
              )}`
            : 'Select a class to view its roster.'
        }
      />

      {classesQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[6.5rem] w-full rounded-xl" />
          ))}
          <span className="sr-only" role="status">
            Loading classes
          </span>
        </div>
      ) : classesQuery.error ? (
        <div className="rounded-xl border border-border bg-card">
          <ErrorPanel
            error={classesQuery.error}
            onRetry={() => void classesQuery.refetch()}
            title="We could not load the classes"
          />
        </div>
      ) : classes && classes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((schoolClass) => (
            <ClassCard
              key={schoolClass.id}
              schoolClass={schoolClass}
              selected={schoolClass.id === selectedClassId}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <EmptyPanel
            icon={SchoolIcon}
            title="No classes available"
            description="There are no classes to manage yet."
          />
        </div>
      )}
    </>
  );
}
