'use client';

import { useEffect, useState } from 'react';

/**
 * Delays propagating a fast-changing value (a search box) so we issue one
 * request per pause in typing instead of one per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
