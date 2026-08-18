'use client';

import { SearchXIcon, UsersIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/common/page-header';
import { Pagination } from '@/components/common/pagination';
import { SearchInput } from '@/components/common/search-input';
import { Skeleton } from '@/components/common/skeleton';
import { EmptyPanel, ErrorPanel } from '@/components/common/state-panels';
import { Button } from '@/components/ui/button';
import { RosterTable } from '@/components/students/roster-table';
import { useStudents } from '@/hooks/queries/use-students';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useUrlState } from '@/hooks/use-url-state';
import { fullName, pluralize } from '@/lib/format';
import { paginate } from '@/lib/paginate';

const PAGE_SIZE = 10;

/**
 * Read-only directory of every student, and the parent route for
 * `/students/[studentId]`.
 *
 * `GET /students` exposes no `search` parameter, so this list is filtered in
 * the browser. Class rosters use the API's server-side search instead.
 */
export function StudentsDirectoryView() {
  const { searchParams, setParams } = useUrlState();

  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '');
  const [page, setPage] = useState(() => Number(searchParams.get('page')) || 1);

  const debouncedSearch = useDebouncedValue(searchInput, 200);
  const studentsQuery = useStudents();

  // Reset to the first page whenever the search term changes (adjusted during
  // render, not in an effect — see `class-detail-view.tsx`).
  const [searchAtPageReset, setSearchAtPageReset] = useState(debouncedSearch);

  if (searchAtPageReset !== debouncedSearch) {
    setSearchAtPageReset(debouncedSearch);
    setPage(1);
  }

  useEffect(() => {
    const currentQuery = searchParams.get('q') ?? '';
    const currentPage = searchParams.get('page') ?? '';
    const nextPage = page > 1 ? String(page) : '';

    if (currentQuery === debouncedSearch && currentPage === nextPage) return;

    setParams({ q: debouncedSearch || null, page: nextPage || null });
  }, [debouncedSearch, page, searchParams, setParams]);

  const filtered = useMemo(() => {
    const students = studentsQuery.data?.students ?? [];
    const term = debouncedSearch.trim().toLowerCase();

    if (!term) return students;

    return students.filter(
      (student) =>
        fullName(student).toLowerCase().includes(term) ||
        student.id.toLowerCase().includes(term)
    );
  }, [studentsQuery.data?.students, debouncedSearch]);

  const pageData = paginate(filtered, page, PAGE_SIZE);
  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <>
      <PageHeader
        title="Students"
        description="Every student on record, whether or not they are in a class."
      />

      <section
        aria-label="Student directory"
        className="overflow-hidden rounded-xl border border-border bg-card"
      >
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            label="Search the student directory by name or student ID"
            placeholder="Search by name or student ID"
            className="sm:max-w-sm sm:flex-1"
          />

          <p className="text-xs text-muted-foreground" aria-live="polite">
            {studentsQuery.isLoading
              ? 'Loading directory…'
              : isSearching
                ? `${pluralize(filtered.length, 'match', 'matches')} for “${debouncedSearch}”`
                : pluralize(filtered.length, 'student')}
          </p>
        </div>

        {studentsQuery.isLoading ? (
          <div className="space-y-3 p-4">
            <span className="sr-only" role="status">
              Loading students
            </span>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-44" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : studentsQuery.error ? (
          <ErrorPanel
            error={studentsQuery.error}
            onRetry={() => void studentsQuery.refetch()}
            title="We could not load the student directory"
          />
        ) : filtered.length === 0 ? (
          isSearching ? (
            <EmptyPanel
              icon={SearchXIcon}
              title="No students match your search"
              description={`Nothing in the directory matches “${debouncedSearch}”.`}
              action={
                <Button variant="outline" size="lg" onClick={() => setSearchInput('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyPanel
              icon={UsersIcon}
              title="No students on record"
              description="Students will appear here once they are added to the school."
            />
          )
        ) : (
          <>
            <RosterTable
              students={pageData.items}
              caption="All students in the school directory"
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
    </>
  );
}
