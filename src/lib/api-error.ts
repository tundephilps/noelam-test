import axios from 'axios';

import type { ApiErrorBody } from '@/types/api';

export type ApiErrorKind =
  | 'network'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unknown';

/**
 * Everything thrown out of the service layer is an `ApiError`, so UI code never
 * has to know it is talking to axios. `kind` is what components branch on;
 * `message` is always safe to render to an administrator.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;

  constructor(message: string, kind: ApiErrorKind, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  /** 4xx responses are the server's final answer — retrying will not help. */
  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'server';
  }
}

const FALLBACK_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'We could not reach the server. Check your connection and try again.',
  not_found: 'We could not find what you were looking for.',
  conflict: 'That action conflicts with the current data.',
  validation: 'The request was rejected. Please review the details and try again.',
  server: 'Something went wrong on the server. Please try again.',
  unknown: 'Something went wrong. Please try again.',
};

function kindForStatus(status: number): ApiErrorKind {
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  if (status >= 500) return 'server';
  return 'unknown';
}

/** Normalises anything axios (or the runtime) can throw into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status ?? null;

    if (status === null) {
      return new ApiError(FALLBACK_MESSAGES.network, 'network', null);
    }

    const kind = kindForStatus(status);
    const serverMessage = error.response?.data?.message?.trim();

    return new ApiError(serverMessage || FALLBACK_MESSAGES[kind], kind, status);
  }

  if (error instanceof Error && error.message) {
    return new ApiError(error.message, 'unknown', null);
  }

  return new ApiError(FALLBACK_MESSAGES.unknown, 'unknown', null);
}