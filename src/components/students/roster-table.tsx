'use client';

import Link from 'next/link';
import { ChevronRightIcon, EyeIcon, UserMinusIcon } from 'lucide-react';

import { Spinner } from '@/components/common/spinner';
import { StatusBadge } from '@/components/common/status-badge';
import { StudentAvatar } from '@/components/students/student-avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ageInYears, fullName, titleCase } from '@/lib/format';
import type { Student } from '@/types/api';

interface RosterTableProps {
  students: Student[];
  /** Id of the student whose removal is in flight, if any. */
  removingStudentId?: string | null;
  /**
   * Omitted by the read-only student directory, which has no class context to
   * remove a student from.
   */
  onRemove?: (student: Student) => void;
  /** Accessible caption describing what the table currently shows. */
  caption: string;
}

function ageLabel(student: Student) {
  const age = ageInYears(student.dateOfBirth);

  return age === null ? '—' : `${age}`;
}

/**
 * Roster of one class. A real table on desktop (sortable-looking headers,
 * scannable columns) and a stacked card list under `md`, where a 6-column
 * table would either overflow or become unreadable.
 */
export function RosterTable({
  students,
  removingStudentId,
  onRemove,
  caption,
}: RosterTableProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <caption className="sr-only">{caption}</caption>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Student</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students.map((student) => {
              const removing = removingStudentId === student.id;

              return (
                <TableRow key={student.id} className="border-border">
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={student} />
                      <div className="min-w-0">
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {fullName(student)}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {student.id}
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {titleCase(student.gender)}
                  </TableCell>

                  <TableCell className="tabular-nums text-muted-foreground">
                    {ageLabel(student)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={student.status} />
                  </TableCell>

                  <TableCell className="pr-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href={`/students/${student.id}`} />}
                        title={`View ${fullName(student)}`}
                      >
                        <EyeIcon aria-hidden="true" />
                        <span className="sr-only">
                          View details for {fullName(student)}
                        </span>
                      </Button>

                      {onRemove ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          disabled={removing}
                          onClick={() => onRemove(student)}
                          title={`Remove ${fullName(student)} from this class`}
                        >
                          {removing ? (
                            <Spinner className="size-3.5" />
                          ) : (
                            <UserMinusIcon aria-hidden="true" />
                          )}
                          <span className="sr-only">
                            Remove {fullName(student)} from this class
                          </span>
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <ul className="divide-y divide-border md:hidden">
        {students.map((student) => {
          const removing = removingStudentId === student.id;

          return (
            <li key={student.id} className="p-4">
              <div className="flex items-start gap-3">
                <StudentAvatar student={student} />

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/students/${student.id}`}
                    className="flex items-center gap-1 font-medium text-foreground"
                  >
                    <span className="truncate">{fullName(student)}</span>
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </Link>

                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {student.id}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{titleCase(student.gender)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ageLabel(student)} yrs</span>
                    <StatusBadge status={student.status} />
                  </div>
                </div>

                {onRemove ? (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-muted-foreground"
                    disabled={removing}
                    onClick={() => onRemove(student)}
                  >
                    {removing ? (
                      <Spinner className="size-3.5" />
                    ) : (
                      <UserMinusIcon aria-hidden="true" />
                    )}
                    <span className="sr-only">
                      Remove {fullName(student)} from this class
                    </span>
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
