'use client';

import Link from 'next/link';
import {
  CircleCheckIcon,
  SchoolIcon,
  UserMinusIcon,
  UsersIcon,
} from 'lucide-react';
import { useMemo } from 'react';

import { ClassCard } from '@/components/classes/class-card';
import { EmptyPanel, ErrorPanel } from '@/components/common/state-panels';
import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@/components/common/skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { useClasses } from '@/hooks/queries/use-classes';
import { useStudents } from '@/hooks/queries/use-students';
import { useSelectedClass } from '@/hooks/use-selected-class';
import { pluralize } from '@/lib/format';

export function DashboardView() {
  const classesQuery = useClasses();
  const studentsQuery = useStudents();
  const { selectedClassId } = useSelectedClass();

  const classes = classesQuery.data;
  const students = studentsQuery.data?.students;

  const stats = useMemo(() => {
    if (!students || !classes) return null;

    const enrolledIds = new Set(classes.flatMap((item) => item.studentIds));
    const activeCount = students.filter((item) => item.status === 'active').length;

    return {
      totalStudents: studentsQuery.data?.total ?? students.length,
      totalClasses: classes.length,
      activeStudents: activeCount,
      activeShare: students.length ? activeCount / students.length : 0,
      unassignedStudents: students.filter((item) => !enrolledIds.has(item.id)).length,
    };
  }, [students, classes, studentsQuery.data?.total]);

  const isLoading = classesQuery.isLoading || studentsQuery.isLoading;
  const error = classesQuery.error ?? studentsQuery.error;

  function retry() {
    void classesQuery.refetch();
    void studentsQuery.refetch();
  }

  if (error && !stats) {
    return (
      <>
        <PageHeader title="Dashboard" description="School overview" />
        <div className="rounded-xl border border-border bg-card">
          <ErrorPanel
            error={error}
            onRetry={retry}
            title="We could not load the school overview"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of enrolment across the school."
      />

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total students"
          value={stats?.totalStudents ?? 0}
          icon={UsersIcon}
          tone="primary"
          loading={isLoading}
          hint="Across the entire student directory"
        />
        <StatCard
          label="Total classes"
          value={stats?.totalClasses ?? 0}
          icon={SchoolIcon}
          tone="neutral"
          loading={isLoading}
          hint="Available for enrolment"
        />
        <StatCard
          label="Active students"
          value={stats?.activeStudents ?? 0}
          icon={CircleCheckIcon}
          tone="success"
          loading={isLoading}
          share={stats?.activeShare}
          hint={
            stats
              ? `${Math.round(stats.activeShare * 100)}% of all students are active`
              : undefined
          }
        />
        <StatCard
          label="Not in a class"
          value={stats?.unassignedStudents ?? 0}
          icon={UserMinusIcon}
          tone="warning"
          loading={isLoading}
          hint="Students available to enrol"
        />
      </section>

      <section aria-labelledby="classes-heading" className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="classes-heading" className="text-base font-semibold tracking-tight">
              Classes
            </h2>
            <p className="text-sm text-muted-foreground">
              Select a class to view and manage its roster.
            </p>
          </div>

          <Link
            href="/classes"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {classesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[6.5rem] w-full rounded-xl" />
            ))}
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
              title="No classes yet"
              description="Once classes are created they will appear here."
            />
          </div>
        )}
      </section>

      {stats ? (
        <p className="mt-6 text-xs text-muted-foreground">
          {pluralize(stats.totalStudents, 'student')} ·{' '}
          {pluralize(stats.totalClasses, 'class', 'classes')} ·{' '}
          {stats.unassignedStudents} awaiting enrolment
        </p>
      ) : null}
    </>
  );
}
