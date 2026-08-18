'use client';

import Link from 'next/link';
import {
  CalendarDaysIcon,
  CakeIcon,
  MailIcon,
  PhoneIcon,
  SchoolIcon,
  UserMinusIcon,
  UserRoundIcon,
  UserSearchIcon,
} from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PageHeader } from '@/components/common/page-header';
import { Skeleton } from '@/components/common/skeleton';
import { EmptyPanel, ErrorPanel } from '@/components/common/state-panels';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/components/common/toast';
import { StudentAvatar } from '@/components/students/student-avatar';
import { Button } from '@/components/ui/button';
import { useClasses } from '@/hooks/queries/use-classes';
import { useRemoveStudent } from '@/hooks/queries/use-enrollment';
import { useStudent } from '@/hooks/queries/use-students';
import { toApiError } from '@/lib/api-error';
import { ageInYears, formatDate, fullName, titleCase } from '@/lib/format';

export function StudentDetailView({ studentId }: { studentId: string }) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const studentQuery = useStudent(studentId);
  const classesQuery = useClasses();

  const student = studentQuery.data;

  /**
   * The API has no student → class field, so membership is derived from the
   * class rosters. A student belongs to at most one class in this data set.
   */
  const enrolledClass = classesQuery.data?.find((item) =>
    item.studentIds.includes(studentId)
  );

  const removal = useRemoveStudent(enrolledClass?.id ?? '');
  const studentError = studentQuery.error ? toApiError(studentQuery.error) : null;

  function handleRemove() {
    if (!student || !enrolledClass) return;

    removal.mutate(student.id, {
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Student removed',
          description: `${fullName(student)} is no longer in ${enrolledClass.name}.`,
        });
        setConfirmOpen(false);
      },
      onError: (error) => {
        toast({
          variant: 'error',
          title: 'Could not remove student',
          description: error.message,
        });
        setConfirmOpen(false);
      },
    });
  }

  if (studentError?.kind === 'not_found') {
    return (
      <>
        <PageHeader
          title="Student not found"
          backHref="/students"
          backLabel="All students"
        />
        <div className="rounded-xl border border-border bg-card">
          <EmptyPanel
            icon={UserSearchIcon}
            title={`No student with ID “${studentId}”`}
            description="The record may have been removed, or the link may be out of date."
            action={
              <Button size="lg" nativeButton={false} render={<Link href="/students" />}>
                Back to students
              </Button>
            }
          />
        </div>
      </>
    );
  }

  if (studentQuery.isLoading) {
    return (
      <>
        <PageHeader
          title={<Skeleton className="h-7 w-48" />}
          backHref="/students"
          backLabel="All students"
        />
        <span className="sr-only" role="status">
          Loading student record
        </span>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </>
    );
  }

  if (studentQuery.error || !student) {
    return (
      <>
        <PageHeader
          title="Student"
          backHref="/students"
          backLabel="All students"
        />
        <div className="rounded-xl border border-border bg-card">
          <ErrorPanel
            error={studentQuery.error}
            onRetry={() => void studentQuery.refetch()}
            title="We could not load this student"
          />
        </div>
      </>
    );
  }

  const age = ageInYears(student.dateOfBirth);

  return (
    <>
      <PageHeader
        backHref={enrolledClass ? `/classes/${enrolledClass.id}` : '/students'}
        backLabel={enrolledClass ? `Back to ${enrolledClass.name}` : 'All students'}
        title={fullName(student)}
        description={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-xs">{student.id}</span>
            <span aria-hidden="true">·</span>
            <span>
              {enrolledClass ? `Enrolled in ${enrolledClass.name}` : 'Not in a class'}
            </span>
          </span>
        }
        actions={
          enrolledClass ? (
            <Button
              variant="destructive"
              size="lg"
              disabled={removal.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              <UserMinusIcon aria-hidden="true" data-icon="inline-start" />
              Remove from {enrolledClass.name}
            </Button>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section
          aria-label="Student summary"
          className="rounded-xl border border-border bg-card p-5 lg:col-span-1"
        >
          <div className="flex items-center gap-4">
            <StudentAvatar student={student} className="size-14 text-base" />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {fullName(student)}
              </h2>
              <p className="font-mono text-xs text-muted-foreground">{student.id}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Enrollment status</dt>
              <dd>
                <StatusBadge status={student.status} />
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Class</dt>
              <dd className="text-right font-medium">
                {enrolledClass ? (
                  <Link
                    href={`/classes/${enrolledClass.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {enrolledClass.name}
                  </Link>
                ) : classesQuery.isLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="text-muted-foreground">Not enrolled</span>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Enrolled on</dt>
              <dd className="font-medium">{formatDate(student.enrollmentDate)}</dd>
            </div>
          </dl>
        </section>

        <section
          aria-label="Student details"
          className="rounded-xl border border-border bg-card lg:col-span-2"
        >
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">Student record</h2>
            <p className="text-sm text-muted-foreground">
              Details as held by the school administration.
            </p>
          </div>

          <dl className="grid gap-px overflow-hidden bg-border sm:grid-cols-2">
            <DetailField
              icon={UserRoundIcon}
              label="Full name"
              value={fullName(student)}
            />
            <DetailField
              icon={UserRoundIcon}
              label="Student ID"
              value={<span className="font-mono text-sm">{student.id}</span>}
            />
            <DetailField
              icon={CakeIcon}
              label="Date of birth"
              value={`${formatDate(student.dateOfBirth)}${age === null ? '' : ` · ${age} years old`}`}
            />
            <DetailField
              icon={UserRoundIcon}
              label="Gender"
              value={titleCase(student.gender)}
            />
            <DetailField
              icon={MailIcon}
              label="Email"
              value={
                <a
                  href={`mailto:${student.email}`}
                  className="break-all text-primary underline-offset-4 hover:underline"
                >
                  {student.email}
                </a>
              }
            />
            <DetailField
              icon={PhoneIcon}
              label="Phone number"
              value={
                <a
                  href={`tel:${student.phone}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {student.phone}
                </a>
              }
            />
            <DetailField
              icon={SchoolIcon}
              label="Class"
              value={
                enrolledClass ? (
                  <Link
                    href={`/classes/${enrolledClass.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {enrolledClass.name} ({enrolledClass.id})
                  </Link>
                ) : (
                  'Not enrolled in a class'
                )
              }
            />
            <DetailField
              icon={CalendarDaysIcon}
              label="Enrollment date"
              value={formatDate(student.enrollmentDate)}
            />
          </dl>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove student from class?"
        description={
          <>
            <span className="font-medium text-foreground">{fullName(student)}</span>{' '}
            will be removed from{' '}
            <span className="font-medium text-foreground">
              {enrolledClass?.name ?? 'this class'}
            </span>
            . Their student record is kept and they can be enrolled again later.
          </>
        }
        confirmLabel="Remove student"
        pendingLabel="Removing…"
        destructive
        pending={removal.isPending}
        onConfirm={handleRemove}
      />
    </>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 bg-card px-5 py-4">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-1 text-sm font-medium break-words">{value}</dd>
      </div>
    </div>
  );
}
