'use client';

import { CheckIcon, UserPlusIcon, UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyPanel, ErrorPanel, LoadingPanel } from '@/components/common/state-panels';
import { SearchInput } from '@/components/common/search-input';
import { Spinner } from '@/components/common/spinner';
import { StatusBadge } from '@/components/common/status-badge';
import { useToast } from '@/components/common/toast';
import { StudentAvatar } from '@/components/students/student-avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEnrollStudent } from '@/hooks/queries/use-enrollment';
import { useStudents } from '@/hooks/queries/use-students';
import { fullName } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Student } from '@/types/api';

interface EnrollStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  /** Ids already on this roster — used to block duplicate enrolment up front. */
  enrolledStudentIds: string[];
}

/**
 * Picks an existing student and enrols them into the current class.
 *
 * The directory endpoint (`GET /students`) takes no `search` parameter, so this
 * list is filtered client side — unlike the class roster search, which is
 * server side. Students already on the roster stay visible but disabled, so the
 * reason an enrolment is unavailable is obvious rather than silently missing.
 */
export function EnrollStudentDialog({
  open,
  onOpenChange,
  classId,
  className,
  enrolledStudentIds,
}: EnrollStudentDialogProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Only load the directory once the dialog is actually opened.
  const studentsQuery = useStudents({ enabled: open });
  const enrollment = useEnrollStudent(classId);

  const enrolled = useMemo(
    () => new Set(enrolledStudentIds),
    [enrolledStudentIds]
  );

  /**
   * Single close path: every dismissal (cancel, backdrop, Escape, success)
   * routes through here, so the picker is always reset for the next open.
   */
  function close() {
    setSearch('');
    setSelectedId(null);
    enrollment.reset();
    onOpenChange(false);
  }

  const candidates = useMemo(() => {
    const all = studentsQuery.data?.students ?? [];
    const term = search.trim().toLowerCase();

    const matching = term
      ? all.filter(
          (student) =>
            fullName(student).toLowerCase().includes(term) ||
            student.id.toLowerCase().includes(term)
        )
      : all;

    // Enrollable students first; the rest stay listed but disabled.
    return [...matching].sort((a, b) => {
      const aEnrolled = enrolled.has(a.id) ? 1 : 0;
      const bEnrolled = enrolled.has(b.id) ? 1 : 0;

      if (aEnrolled !== bEnrolled) return aEnrolled - bEnrolled;

      return fullName(a).localeCompare(fullName(b));
    });
  }, [studentsQuery.data?.students, search, enrolled]);

  const availableCount = candidates.filter((item) => !enrolled.has(item.id)).length;
  const selected = candidates.find((item) => item.id === selectedId) ?? null;

  function handleSubmit() {
    if (!selected || enrollment.isPending) return;

    enrollment.mutate(selected.id, {
      onSuccess: () => {
        toast({
          variant: 'success',
          title: 'Student enrolled',
          description: `${fullName(selected)} was added to ${className}.`,
        });
        close();
      },
      onError: (error) => {
        // 409 means someone enrolled them first — the roster refetch triggered
        // by the mutation will grey the row out.
        toast({
          variant: 'error',
          title:
            error.kind === 'conflict'
              ? 'Already enrolled'
              : 'Could not enrol student',
          description: error.message,
        });
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        // Never dismiss mid-request: the enrolment is already in flight.
        if (enrollment.isPending || nextOpen) return;

        close();
      }}
    >
      <DialogContent
        showCloseButton={!enrollment.isPending}
        className="flex max-h-[85vh] flex-col sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>Enrol a student</DialogTitle>
          <DialogDescription>
            Select an existing student to add to{' '}
            <span className="font-medium text-foreground">{className}</span>.
          </DialogDescription>
        </DialogHeader>

        <SearchInput
          value={search}
          onChange={setSearch}
          label="Search the student directory by name or ID"
          placeholder="Search by name or student ID"
        />

        <div className="min-h-64 flex-1 overflow-y-auto rounded-lg border border-border">
          {studentsQuery.isLoading ? (
            <LoadingPanel label="Loading student directory…" />
          ) : studentsQuery.error ? (
            <ErrorPanel
              error={studentsQuery.error}
              onRetry={() => void studentsQuery.refetch()}
              title="We could not load the student directory"
            />
          ) : candidates.length === 0 ? (
            <EmptyPanel
              icon={UsersIcon}
              title={search ? 'No students match your search' : 'No students found'}
              description={
                search
                  ? `Nothing in the directory matches “${search}”.`
                  : 'The student directory is empty.'
              }
            />
          ) : availableCount === 0 ? (
            <EmptyPanel
              icon={CheckIcon}
              title="Everyone here is already enrolled"
              description={`All matching students are already in ${className}.`}
            />
          ) : (
            <ul
              role="radiogroup"
              aria-label="Students available to enrol"
              className="divide-y divide-border"
            >
              {candidates.map((student) => (
                <CandidateRow
                  key={student.id}
                  student={student}
                  alreadyEnrolled={enrolled.has(student.id)}
                  selected={student.id === selectedId}
                  disabled={enrollment.isPending}
                  onSelect={() => setSelectedId(student.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {selected
              ? `Selected: ${fullName(selected)}`
              : `${availableCount} student${availableCount === 1 ? '' : 's'} available`}
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              disabled={enrollment.isPending}
              onClick={close}
            >
              Cancel
            </Button>

            <Button
              size="lg"
              disabled={!selected || enrollment.isPending}
              onClick={handleSubmit}
            >
              {enrollment.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Enrolling…
                </>
              ) : (
                <>
                  <UserPlusIcon aria-hidden="true" data-icon="inline-start" />
                  Enrol student
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CandidateRow({
  student,
  alreadyEnrolled,
  selected,
  disabled,
  onSelect,
}: {
  student: Student;
  alreadyEnrolled: boolean;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <li role="presentation">
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        disabled={alreadyEnrolled || disabled}
        onClick={onSelect}
        className={cn(
          'flex w-full items-center gap-3 p-3 text-left transition-colors outline-none focus-visible:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset',
          alreadyEnrolled
            ? 'cursor-not-allowed opacity-55'
            : 'hover:bg-accent/50',
          selected && 'bg-accent'
        )}
      >
        <StudentAvatar student={student} className="size-8" />

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {fullName(student)}
          </span>
          <span className="block truncate font-mono text-xs text-muted-foreground">
            {student.id}
          </span>
        </span>

        {alreadyEnrolled ? (
          <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Already enrolled
          </span>
        ) : (
          <StatusBadge status={student.status} className="shrink-0" />
        )}

        <span
          aria-hidden="true"
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-input'
          )}
        >
          {selected ? <CheckIcon className="size-3" /> : null}
        </span>
      </button>
    </li>
  );
}
