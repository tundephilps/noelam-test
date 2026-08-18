import path from 'node:path';

import { defineConfig } from 'vitest/config';

/**
 * Tests run through vitest's built-in transform rather than the Babel React
 * plugin: the starter pins a Babel tree (via `shadcn`) that the plugin cannot
 * resolve against, and the automatic JSX runtime is all these tests need.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The mock API delays every response by 500ms, and the flow tests chain
    // several requests (load → mutate → refetch) behind a 300ms search debounce.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});