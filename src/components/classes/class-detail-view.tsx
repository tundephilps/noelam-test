'use client';

import Link from 'next/link';
import { SearchXIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { ClassSwitcher } from '@/components/classes/class-switcher';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { SearchInput } from '@/components/common/search-input';
import { Skeleton } from '@/components/common/skeleton';
import { EmptyPanel, ErrorPanel } from '@/components/common/state-panels';
import { useToast } from '@/components/common/toast';
import { EnrollStudentDialog } from '@/components/students/enroll-student-dialog';
import { RosterTable } from '@/components/students/roster-table';
import { Button } from '@/components/ui/button';
import { useClass, useClassStudents, useClasses } from '@/hooks/queries/use-classes';
import { useRemoveStudent } from '@/hooks/queries/use-enrollment';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useSelectedClass } from '@/hooks/use-selected-class';
import { useUrlState } from '@/hooks/use-url-state';
import { toApiError } from '@/lib/api-error';
import { fullName, pluralize } from '@/lib/format';
import { paginate } from '@/lib/paginate';
import type { Student } from '@/types/api';

const PAGE_SIZE = 8;

export function ClassDetailView({ classId }: { classId: string }) {
  const { toast } = useToast();
  const { selectClass } = useSelectedClass();
  const { searchParams, setParams } = useUrlState();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '');
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<Student | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // A new search term invalidates the current page offset. Adjusted during
  // render (React's documented pattern) rather than in an effect, which would
  // paint page 3 of the old results for a frame.
  const [searchAtPageReset, setSearchAtPageReset] = useState(debouncedSearch);

  if (searchAtPageReset !== debouncedSearch) {
    setSearchAtPageReset(debouncedSearch);
    setPage(1);
  }

  const classesQuery = useClasses();
  const classQuery = useClass(classId);
  const studentsQuery = useClassStudents(classId, debouncedSearch);
  const removal = useRemoveStudent(classId);

  // Remember where the administrator is working (persisted selection).
  useEffect(() => {
    selectClass(classId);
  }, [classId, selectClass]);

  // Mirror search and page into the URL so the view can be shared or restored.
  useEffect(() => {
    const currentQuery = searchParams.get('q') ?? '';
    const currentPage = searchParams.get('page') ?? '';
    const nextPage = page > 1 ? String(page) : '';

    if (currentQuery === debouncedSearch && currentPage === nextPage) return;

    setParams({ q: debouncedSearch || null, page: nextPage || null });
  }, [debouncedSearch, page, searchParams, setParams]);

  const students = useMemo(
    () => studentsQuery.data?.students ?? [],
    [studentsQuery.data?.students]
  );

  const pageData = paginate(students, page, PAGE_SIZE);
  const schoolClass = classQuery.data;
  const isSearching = debouncedSearch.trim().length > 0;

  // Fetching with rows already on screen means a background refresh, not a
  // first load — keep the table visible and show progress in the search field.
  const isRefreshing = studentsQuery.isFetching && !studentsQuery.isLoading;
  const classError = classQuery.error ? toApiError(classQuery.error) : null;

  function handleRemove() {
    const student = pendingRemoval;

    if (!student) return;

    removal.mutate(student.id, {
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Student removed',
          description: `${fullName(student)} is no longer in ${
            schoolClass?.name ?? 'this class'
          }.`,
        });
        setPendingRemoval(null);
      },
      onError: (error) => {
        toast({
          variant: 'error',
          title: 'Could not remove student',
          description: error.message,
        });
        setPendingRemoval(null);
      },
    });
  }

  if (classError?.kind === 'not_found') {
    return (
      <>
        <PageHeader title="Class not found" backHref="/classes" backLabel="All classes" />
        <div className="rounded-xl border border-border bg-card">
          <EmptyPanel
            icon={SearchXIcon}
            title={`No class with ID “${classId}”`}
            description="The class may have been removed, or the link may be out of date."
            action={
              <Button size="lg" nativeButton={false} render={<Link href="/classes" />}>
                Back to classes
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        backHref="/classes"
        backLabel="All classes"
        title={
          classQuery.isLoading ? (
            <Skeleton className="h-7 w-40" />
          ) : (
            (schoolClass?.name ?? 'Class')
          )
        }
        description={
          classQuery.isLoading ? (
            <Skeleton className="h-4 w-56" />
          ) : schoolClass ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-xs">{schoolClass.id}</span>
              <span aria-hidden="true">·</span>
              <span>{pluralize(schoolClass.studentIds.length, 'student enrolled', 'students enrolled')}</span>
            </span>
          ) : null
        }
        actions={
          <>
            {classesQuery.data && classesQuery.data.length > 0 ? (
              <ClassSwitcher
                classes={classesQuery.data}
                currentClassId={classId}
                disabled={removal.isPending}
              />
            ) : null}

            <Button
              size="lg"
              disabled={!schoolClass}
              onClick={() => setEnrollOpen(true)}
            >
              <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
              Enrol student
            </Button>
          </>
        }
      />

      <section
        aria-label="Enrolled students"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            busy={isRefreshing}
            label="Search students in this class by name or student ID"
            placeholder="Search by name or student ID"
            className="sm:max-w-sm sm:flex-1"
          />

          <p className="text-xs text-muted-foreground" aria-live="polite">
            {studentsQuery.isLoading
              ? 'Loading roster…'
              : isSearching
                ? `${pluralize(students.length, 'match', 'matches')} for “${debouncedSearch}”`
                : pluralize(students.length, 'student')}
          </p>
        </div>

        {studentsQuery.isLoading ? (
          <RosterSkeleton />
        ) : studentsQuery.error ? (
          <ErrorPanel
            error={studentsQuery.error}
            onRetry={() => void studentsQuery.refetch()}
            title="We could not load this roster"
          />
        ) : students.length === 0 ? (
          isSearching ? (
            <EmptyPanel
              icon={SearchXIcon}
              title="No students match your search"
              description={`Nothing in this class matches “${debouncedSearch}”. Check the spelling, or search by student ID.`}
              action={
                <Button variant="outline" size="lg" onClick={() => setSearchInput('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyPanel
              icon={UsersIcon}
              title="No students in this class yet"
              description="Enrol an existing student to start building this roster."
              action={
                <Button size="lg" onClick={() => setEnrollOpen(true)}>
                  <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
                  Enrol student
                </Button>
              }
            />
          )
        ) : (
          <>
            <RosterTable
              students={pageData.items}
              removingStudentId={removal.isPending ? pendingRemoval?.id : null}
              onRemove={setPendingRemoval}
              caption={`Students enrolled in ${schoolClass?.name ?? 'this class'}`}
            />

            <Pagination
              page={pageData.page}
              pageCount={pageData.pageCount}
              from={pageData.from}
              to={pageData.to}
              total={pageData.total}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {schoolClass ? (
        <EnrollStudentDialog
          open={enrollOpen}
          onOpenChange={setEnrollOpen}
          classId={classId}
          className={schoolClass.name}
          enrolledStudentIds={schoolClass.studentIds}
        />
      ) : null}

      <ConfirmDialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
        title="Remove student from class?"
        description={
          pendingRemoval ? (
            <>
              <span className="font-medium text-foreground">
                {fullName(pendingRemoval)}
              </span>{' '}
              will be removed from{' '}
              <span className="font-medium text-foreground">
                {schoolClass?.name ?? 'this class'}
              </span>
              . Their student record is kept and they can be enrolled again later.
            </>
          ) : null
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

function RosterSkeleton() {
  return (
    <div className="p-4">
      <span className="sr-only" role="status">
        Loading students
      </span>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
