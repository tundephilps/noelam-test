import { describe, expect, it } from 'vitest';

import { ageInYears, formatDate, fullName, initials, pluralize, titleCase } from '@/lib/format';

describe('fullName', () => {
  it('joins first and last name', () => {
    expect(fullName({ firstName: 'Amina', lastName: 'Bello' })).toBe('Amina Bello');
  });
});

describe('initials', () => {
  it('takes the first letter of each name, upper-cased', () => {
    expect(initials({ firstName: 'chukwuemeka', lastName: 'obi' })).toBe('CO');
  });
});

describe('formatDate', () => {
  it('formats an ISO date without leading zeros', () => {
    expect(formatDate('2010-04-15')).toBe('15 Apr 2010');
    expect(formatDate('2011-01-05')).toBe('5 Jan 2011');
  });

  it('does not shift the day across timezones', () => {
    // A `new Date('2010-01-01')` based formatter renders 31 Dec west of UTC.
    expect(formatDate('2010-01-01')).toBe('1 Jan 2010');
  });

  it('returns the input unchanged when it is not a date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('ageInYears', () => {
  const today = new Date(2026, 7, 18); // 18 Aug 2026

  it('counts whole years', () => {
    expect(ageInYears('2010-04-15', today)).toBe(16);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    expect(ageInYears('2010-12-31', today)).toBe(15);
  });

  it('counts the birthday itself', () => {
    expect(ageInYears('2010-08-18', today)).toBe(16);
  });

  it('returns null for an unparseable date', () => {
    expect(ageInYears('', today)).toBeNull();
  });
});

describe('pluralize', () => {
  it('uses the singular for exactly one', () => {
    expect(pluralize(1, 'student')).toBe('1 student');
  });

  it('uses the plural for zero and many', () => {
    expect(pluralize(0, 'student')).toBe('0 students');
    expect(pluralize(4, 'student')).toBe('4 students');
  });

  it('accepts an irregular plural', () => {
    expect(pluralize(2, 'class', 'classes')).toBe('2 classes');
  });
});

describe('titleCase', () => {
  it('capitalises the first letter only', () => {
    expect(titleCase('female')).toBe('Female');
  });
});
