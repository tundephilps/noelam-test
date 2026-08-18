import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

import { classes } from '@/mocks/data/classes';
import { server } from '@/test/server';

/**
 * Tests run against the same MSW handlers the browser app uses, so the suite
 * exercises the real request/response contract instead of a second set of fakes.
 */

// The POST/DELETE handlers mutate the shared mock data, so every test starts
// from the same roster.
const initialRosters = classes.map((item) => [...item.studentIds]);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

beforeEach(() => {
  classes.forEach((item, index) => {
    item.studentIds = [...initialRosters[index]];
  });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.useRealTimers();
});

afterAll(() => server.close());

// jsdom implements neither of these, and the dialog primitives call both.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}