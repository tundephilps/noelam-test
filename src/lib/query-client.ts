import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api-error';

/**
 * Retry transport failures a couple of times, but never retry a 4xx: a 404 or a
 * 409 is a final answer and retrying only delays the message to the user.
 */
function retry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && !error.isRetryable) return false;

  return failureCount < 2;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
