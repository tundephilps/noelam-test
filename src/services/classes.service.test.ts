import { describe, expect, it } from 'vitest';

import { ApiError } from '@/lib/api-error';
import {
  enrollStudent,
  fetchClass,
  fetchClassStudents,
  fetchClasses,
  removeStudentFromClass,
} from '@/services/classes.service';

/**
 * Runs against the project's own MSW handlers, so these tests fail if the API
 * contract changes shape — not just if our code changes.
 */

describe('fetchClasses', () => {
  it('unwraps the `data` envelope', async () => {
    const classes = await fetchClasses();

    expect(classes.length).toBeGreaterThan(0);
    expect(classes[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      studentIds: expect.any(Array),
    });
  });
});

describe('fetchClass', () => {
  it('returns a single class', async () => {
    await expect(fetchClass('CLS-001')).resolves.toMatchObject({
      id: 'CLS-001',
      name: 'SS1A',
    });
  });

  it('raises a not_found ApiError for an unknown class', async () => {
    const error = await fetchClass('CLS-999').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('not_found');
    expect((error as ApiError).message).toBe('Class not found');
  });
});

describe('fetchClassStudents', () => {
  it('returns the roster with a total', async () => {
    const result = await fetchClassStudents({ classId: 'CLS-001' });

    expect(result.total).toBe(result.students.length);
    expect(result.students).toHaveLength(4);
  });

  it('asks the API to search by name rather than filtering locally', async () => {
    const result = await fetchClassStudents({ classId: 'CLS-001', search: 'amina' });

    expect(result.students).toHaveLength(1);
    expect(result.students[0].firstName).toBe('Amina');
  });

  it('searches by student ID too', async () => {
    const result = await fetchClassStudents({ classId: 'CLS-001', search: 'STU-003' });

    expect(result.students.map((student) => student.id)).toEqual(['STU-003']);
  });

  it('returns an empty roster rather than an error when nothing matches', async () => {
    const result = await fetchClassStudents({
      classId: 'CLS-001',
      search: 'zzzz-no-such-student',
    });

    expect(result.students).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('ignores a whitespace-only search term', async () => {
    const result = await fetchClassStudents({ classId: 'CLS-001', search: '   ' });

    expect(result.students).toHaveLength(4);
  });
});

describe('enrollStudent', () => {
  it('adds a student to the roster', async () => {
    const response = await enrollStudent('CLS-001', 'STU-020');

    expect(response.data?.id).toBe('STU-020');

    const roster = await fetchClassStudents({ classId: 'CLS-001' });

    expect(roster.students.map((student) => student.id)).toContain('STU-020');
  });

  it('rejects a duplicate enrolment with a conflict', async () => {
    const error = await enrollStudent('CLS-001', 'STU-001').catch(
      (caught: unknown) => caught
    );

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('conflict');
    expect((error as ApiError).status).toBe(409);
  });

  it('rejects an unknown student', async () => {
    const error = await enrollStudent('CLS-001', 'STU-999').catch(
      (caught: unknown) => caught
    );

    expect((error as ApiError).kind).toBe('not_found');
  });
});

describe('removeStudentFromClass', () => {
  it('removes an enrolled student', async () => {
    await removeStudentFromClass('CLS-001', 'STU-002');

    const roster = await fetchClassStudents({ classId: 'CLS-001' });

    expect(roster.students.map((student) => student.id)).not.toContain('STU-002');
  });

  it('reports a student who is not on the roster', async () => {
    const error = await removeStudentFromClass('CLS-001', 'STU-020').catch(
      (caught: unknown) => caught
    );

    expect((error as ApiError).kind).toBe('not_found');
    expect((error as ApiError).message).toBe('Student is not enrolled in this class');
  });
});
