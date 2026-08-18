import { createPersistedStore } from '@/lib/persisted-store';

/** The class the administrator is currently working in. */
export const selectedClassStore = createPersistedStore<string | null>({
  key: 'sms:selected-class',
  serverValue: null,
  parse: (raw) => raw,
  serialize: (value) => value,
});

/** Whether the desktop navigation pane is collapsed to an icon rail. */
export const sidebarCollapsedStore = createPersistedStore<boolean>({
  key: 'sms:sidebar-collapsed',
  serverValue: false,
  parse: (raw) => raw === 'true',
  serialize: (value) => String(value),
});

export type Theme = 'light' | 'dark';

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/**
 * Theme choice. The inline boot script in the root layout applies the same
 * rule before first paint; this store keeps React in step afterwards.
 */
export const themeStore = createPersistedStore<Theme>({
  key: 'sms:theme',
  serverValue: 'light',
  parse: (raw) => (raw === 'dark' || raw === 'light' ? raw : prefersDark() ? 'dark' : 'light'),
  serialize: (value) => value,
  onChange: (value) => {
    document.documentElement.classList.toggle('dark', value === 'dark');
  },
});
