/**
 * Central query-key factory. Every key starts with a resource segment so a
 * mutation can invalidate a whole resource (`queryKeys.classes.all`) or one
 * precise entry without string-matching keys at the call site.
 */
export const queryKeys = {
  classes: {
    all: ['classes'] as const,
    list: () => [...queryKeys.classes.all, 'list'] as const,
    detail: (classId: string) =>
      [...queryKeys.classes.all, 'detail', classId] as const,
    students: (classId: string, search: string) =>
      [...queryKeys.classes.all, 'detail', classId, 'students', { search }] as const,
  },
  students: {
    all: ['students'] as const,
    list: () => [...queryKeys.students.all, 'list'] as const,
    detail: (studentId: string) =>
      [...queryKeys.students.all, 'detail', studentId] as const,
  },
} as const;
