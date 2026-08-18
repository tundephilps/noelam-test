'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import { fetchStudent, fetchStudents } from '@/services/students.service';

export function useStudents(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.students.list(),
    queryFn: ({ signal }) => fetchStudents(signal),
    enabled: options?.enabled ?? true,
  });
}

export function useStudent(studentId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.students.detail(studentId ?? ''),
    queryFn: ({ signal }) => fetchStudent(studentId as string, signal),
    enabled: Boolean(studentId),
  });
}
