import type { Student } from '@/types/api';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function fullName(student: Pick<Student, 'firstName' | 'lastName'>) {
  return `${student.firstName} ${student.lastName}`.trim();
}

export function initials(student: Pick<Student, 'firstName' | 'lastName'>) {
  const first = student.firstName.trim().charAt(0);
  const last = student.lastName.trim().charAt(0);

  return `${first}${last}`.toUpperCase();
}

/**
 * Formats an ISO `YYYY-MM-DD` date as `15 Apr 2010`.
 *
 * Deliberately hand-rolled rather than `toLocaleDateString`: the output must not
 * change with the machine locale or timezone, otherwise server and client
 * markup can disagree and dates shift a day either side of UTC.
 */
export function formatDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);

  if (!match) return isoDate;

  const [, year, month, day] = match;
  const monthLabel = MONTHS[Number(month) - 1];

  if (!monthLabel) return isoDate;

  return `${Number(day)} ${monthLabel} ${year}`;
}

/** Whole years between `dateOfBirth` and `on` (defaults to today). */
export function ageInYears(dateOfBirth: string, on: Date = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOfBirth);

  if (!match) return null;

  const [, year, month, day] = match.map(Number) as [
    unknown,
    number,
    number,
    number,
  ];

  let age = on.getFullYear() - year;
  const hasHadBirthday =
    on.getMonth() + 1 > month ||
    (on.getMonth() + 1 === month && on.getDate() >= day);

  if (!hasHadBirthday) age -= 1;

  return age < 0 ? null : age;
}

export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** `1 student` / `4 students` — avoids the "1 students" bug in every count label. */
export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
