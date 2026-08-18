'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { selectedClassStore } from '@/lib/ui-stores';

/**
 * The class an administrator is currently working in, persisted to
 * localStorage so it survives navigation and reloads (optional requirement:
 * "persist the currently selected class").
 */
export function useSelectedClass() {
  const selectedClassId = useSyncExternalStore(
    selectedClassStore.subscribe,
    selectedClassStore.getSnapshot,
    selectedClassStore.getServerSnapshot
  );

  const selectClass = useCallback((classId: string | null) => {
    selectedClassStore.set(classId);
  }, []);

  return { selectedClassId, selectClass };
}
