/**
 * Tiny localStorage-backed store built for `useSyncExternalStore`.
 *
 * Persisted UI preferences (selected class, sidebar state, theme) cannot be
 * read during render on the server, and reading them in an effect causes a
 * cascading re-render. An external store solves both: React renders the server
 * snapshot during hydration, then switches to the real value in one pass.
 */
export interface PersistedStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
  /** Test helper — drops cached state and listeners. */
  reset: () => void;
}

export interface PersistedStoreOptions<T> {
  key: string;
  /** Value used on the server and during hydration. */
  serverValue: T;
  /** Turns the raw stored string (or `null`) into a value. */
  parse: (raw: string | null) => T;
  /** Turns a value into the string to store; `null` removes the entry. */
  serialize: (value: T) => string | null;
  /** Side effect to run whenever the value changes, e.g. toggling a class. */
  onChange?: (value: T) => void;
}

export function createPersistedStore<T>({
  key,
  serverValue,
  parse,
  serialize,
  onChange,
}: PersistedStoreOptions<T>): PersistedStore<T> {
  const listeners = new Set<() => void>();

  // `getSnapshot` must be referentially stable between renders, so the value is
  // cached rather than re-read from storage on every call.
  let snapshot: T = serverValue;
  let hydrated = false;

  function read(): T {
    try {
      return parse(window.localStorage.getItem(key));
    } catch {
      // Storage can throw in private browsing; fall back to the default.
      return parse(null);
    }
  }

  function emit() {
    listeners.forEach((listener) => listener());
  }

  return {
    subscribe(listener) {
      listeners.add(listener);

      // Keep other tabs of the same origin in step.
      const onStorage = (event: StorageEvent) => {
        if (event.key !== key) return;

        snapshot = parse(event.newValue);
        hydrated = true;
        onChange?.(snapshot);
        emit();
      };

      window.addEventListener('storage', onStorage);

      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },

    getSnapshot() {
      if (!hydrated) {
        snapshot = read();
        hydrated = true;
      }

      return snapshot;
    },

    getServerSnapshot() {
      return serverValue;
    },

    set(value) {
      snapshot = value;
      hydrated = true;

      try {
        const serialized = serialize(value);

        if (serialized === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialized);
        }
      } catch {
        // Ignore: the in-memory snapshot still drives this session.
      }

      onChange?.(value);
      emit();
    },

    reset() {
      snapshot = serverValue;
      hydrated = false;
      listeners.clear();
    },
  };
}
