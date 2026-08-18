'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api-error';
import { queryKeys } from '@/hooks/queries/query-keys';
import {
  enrollStudent,
  removeStudentFromClass,
} from '@/services/classes.service';
import type { MutationResponse, Student } from '@/types/api';

/**
 * Enrolment changes a class roster, the class student count and the class shown
 * on a student's profile — all of which hang off the `classes` key — so both
 * mutations invalidate that resource wholesale rather than hand-patching caches.
 */
function useRosterInvalidation() {
  const queryClient = useQueryClient();

  return () => queryClient.invalidateQueries({ queryKey: queryKeys.classes.all });
}

export function useEnrollStudent(classId: string) {
  const invalidateRoster = useRosterInvalidation();

  return useMutation<MutationResponse<Student>, ApiError, string>({
    mutationFn: (studentId: string) => enrollStudent(classId, studentId),
    onSuccess: invalidateRoster,
    onError: (error) => {
      // A 409 means our roster is stale — refetch so the UI stops offering an
      // enrolment that the server already has.
      if (error.kind === 'conflict') void invalidateRoster();
    },
  });
}

export function useRemoveStudent(classId: string) {
  const invalidateRoster = useRosterInvalidation();

  return useMutation<MutationResponse, ApiError, string>({
    mutationFn: (studentId: string) => removeStudentFromClass(classId, studentId),
    onSuccess: invalidateRoster,
    onError: (error) => {
      if (error.kind === 'not_found') void invalidateRoster();
    },
  });
}
