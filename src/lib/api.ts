import axios from 'axios';

import { toApiError } from '@/lib/api-error';

/**
 * Single axios instance for the whole app.
 *
 * The mock API is served by a Mock Service Worker registered in the browser,
 * so requests are relative and are only ever issued from the client.
 */
export const api = axios.create({
  baseURL: '/api',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalise transport-level failures once, at the boundary, so no component or
// hook ever inspects an axios error shape.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error))
);