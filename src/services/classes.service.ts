import { api } from '@/lib/api';
import type {
  Class,
  CollectionResponse,
  MutationResponse,
  Student,
} from '@/types/api';

export interface ClassStudentsQuery {
  classId: string;
  /** Forwarded to the API as `?search=` — matching happens server side. */
  search?: string;
}

export interface ClassStudentsResult {
  students: Student[];
  total: number;
}

export async function fetchClasses(signal?: AbortSignal): Promise<Class[]> {
  const { data } = await api.get<CollectionResponse<Class>>('/classes', {
    signal,
  });

  return data.data;
}

export async function fetchClass(
  classId: string,
  signal?: AbortSignal
): Promise<Class> {
  const { data } = await api.get<Class>(
    `/classes/${encodeURIComponent(classId)}`,
    { signal }
  );

  return data;
}

export async function fetchClassStudents(
  { classId, search }: ClassStudentsQuery,
  signal?: AbortSignal
): Promise<ClassStudentsResult> {
  const trimmed = search?.trim();

  const { data } = await api.get<CollectionResponse<Student>>(
    `/classes/${encodeURIComponent(classId)}/students`,
    {
      params: trimmed ? { search: trimmed } : undefined,
      signal,
    }
  );

  return {
    students: data.data,
    total: data.total ?? data.data.length,
  };
}

export async function enrollStudent(
  classId: string,
  studentId: string
): Promise<MutationResponse<Student>> {
  const { data } = await api.post<MutationResponse<Student>>(
    `/classes/${encodeURIComponent(classId)}/students`,
    { studentId }
  );

  return data;
}

export async function removeStudentFromClass(
  classId: string,
  studentId: string
): Promise<MutationResponse> {
  const { data } = await api.delete<MutationResponse>(
    `/classes/${encodeURIComponent(classId)}/students/${encodeURIComponent(
      studentId
    )}`
  );

  return data;
}