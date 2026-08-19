import { describe, expect, it } from 'vitest';

import { pageWindow, paginate } from '@/lib/paginate';

const items = Array.from({ length: 23 }, (_, index) => index + 1);

describe('paginate', () => {
  it('slices the requested page and reports its range', () => {
    const page = paginate(items, 2, 8);

    expect(page.items).toEqual([9, 10, 11, 12, 13, 14, 15, 16]);
    expect(page.from).toBe(9);
    expect(page.to).toBe(16);
    expect(page.total).toBe(23);
    expect(page.pageCount).toBe(3);
  });

  it('returns a short final page', () => {
    const page = paginate(items, 3, 8);

    expect(page.items).toEqual([17, 18, 19, 20, 21, 22, 23]);
    expect(page.to).toBe(23);
  });

  it('clamps a page beyond the end instead of returning nothing', () => {
    // Reachable via ?page=99, or by removing the last student on a page.
    const page = paginate(items, 99, 8);

    expect(page.page).toBe(3);
    expect(page.items).toHaveLength(7);
  });

  it('clamps a page below one', () => {
    expect(paginate(items, 0, 8).page).toBe(1);
    expect(paginate(items, -4, 8).page).toBe(1);
  });

  it('handles an empty collection without dividing by zero', () => {
    const page = paginate([], 1, 8);

    expect(page).toMatchObject({
      items: [],
      page: 1,
      pageCount: 1,
      total: 0,
      from: 0,
      to: 0,
    });
  });
});

describe('pageWindow', () => {
  it('lists every page when they fit', () => {
    expect(pageWindow(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it('collapses the middle with an ellipsis marker', () => {
    expect(pageWindow(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
  });

  it('keeps the first and last page reachable', () => {
    const window = pageWindow(1, 20);

    expect(window[0]).toBe(1);
    expect(window[window.length - 1]).toBe(20);
  });
});
