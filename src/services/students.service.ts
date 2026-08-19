import { api } from '@/lib/api';
import type { CollectionResponse, Student } from '@/types/api';

export interface StudentsResult {
  students: Student[];
  total: number;
}

/**
 * `GET /students` returns the full directory. Unlike the class-scoped endpoint
 * it accepts no `search` parameter, so filtering the directory (used by the
 * enrolment picker) happens on the client. See README → Assumptions.
 */
export async function fetchStudents(
  signal?: AbortSignal
): Promise<StudentsResult> {
  const { data } = await api.get<CollectionResponse<Student>>('/students', {
    signal,
  });

  return {
    students: data.data,
    total: data.total ?? data.data.length,
  };
}

export async function fetchStudent(
  studentId: string,
  signal?: AbortSignal
): Promise<Student> {
  const { data } = await api.get<Student>(
    `/students/${encodeURIComponent(studentId)}`,
    { signal }
  );

  return data;
}
