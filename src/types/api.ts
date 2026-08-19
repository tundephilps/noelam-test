/**
 * Types mirroring the mock API contract in `src/mocks`.
 *
 * The API is not perfectly uniform: collection endpoints wrap results in
 * `{ data, total }` while single-resource endpoints return the resource
 * directly. These types keep that distinction explicit so the service layer
 * (and only the service layer) has to deal with it.
 */

export type Gender = 'male' | 'female';

export type StudentStatus = 'active' | 'inactive';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  status: StudentStatus;
}

export interface Class {
  id: string;
  name: string;
  studentIds: string[];
}

/** `GET /classes`, `GET /students`, `GET /classes/:classId/students` */
export interface CollectionResponse<T> {
  data: T[];
  total?: number;
}

/** `POST /classes/:classId/students`, `DELETE /classes/:classId/students/:studentId` */
export interface MutationResponse<TData = never> {
  message: string;
  data?: TData;
}

/** Error body returned by every failing handler. */
export interface ApiErrorBody {
  message?: string;
}
