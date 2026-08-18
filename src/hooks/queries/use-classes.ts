'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import {
  fetchClass,
  fetchClasses,
  fetchClassStudents,
} from '@/services/classes.service';

export function useClasses() {
  return useQuery({
    queryKey: queryKeys.classes.list(),
    queryFn: ({ signal }) => fetchClasses(signal),
  });
}

export function useClass(classId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.classes.detail(classId ?? ''),
    queryFn: ({ signal }) => fetchClass(classId as string, signal),
    enabled: Boolean(classId),
  });
}

/**
 * Students of one class. `search` is passed straight to the API, so filtering
 * runs server side and each distinct term is cached under its own key.
 */
export function useClassStudents(classId: string | undefined, search: string) {
  const normalisedSearch = search.trim();

  return useQuery({
    queryKey: queryKeys.classes.students(classId ?? '', normalisedSearch),
    queryFn: ({ signal }) =>
      fetchClassStudents(
        { classId: classId as string, search: normalisedSearch },
        signal
      ),
    enabled: Boolean(classId),
    // Keeps the previous rows on screen while a new search term is in flight,
    // so the table does not collapse to a spinner on every keystroke.
    placeholderData: (previous) => previous,
  });
}
