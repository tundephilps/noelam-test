export interface Page<T> {
  items: T[];
  /** Clamped into `[1, pageCount]` so an out-of-range `?page=` never blanks the UI. */
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  /** 1-based index of the first item on the page (0 when empty). */
  from: number;
  /** 1-based index of the last item on the page (0 when empty). */
  to: number;
}

/**
 * Client-side pagination.
 *
 * The mock API returns every student of a class in one response and exposes no
 * page/limit parameters, so slicing happens here. Swapping to server-side
 * pagination later only means changing the query hook — the UI consumes `Page`.
 */
export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const total = items.length;
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const pageCount = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (safePage - 1) * safePageSize;
  const pageItems = items.slice(start, start + safePageSize);

  return {
    items: pageItems,
    page: safePage,
    pageCount,
    pageSize: safePageSize,
    total,
    from: total === 0 ? 0 : start + 1,
    to: total === 0 ? 0 : start + pageItems.length,
  };
}

/**
 * Page numbers to render, with `null` marking an ellipsis gap.
 * Keeps the control at a fixed width instead of growing with the data.
 */
export function pageWindow(
  page: number,
  pageCount: number,
  maxButtons = 5
): Array<number | null> {
  if (pageCount <= maxButtons) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, page]);

  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < pageCount) pages.add(page + 1);

  const sorted = [...pages].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const result: Array<number | null> = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push(null);
    result.push(value);
  });

  return result;
}
