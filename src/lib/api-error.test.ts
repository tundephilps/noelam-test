import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { ApiError, toApiError } from '@/lib/api-error';

function axiosErrorWith(status: number, message?: string): AxiosError {
  const config = { headers: new AxiosHeaders() };

  return new AxiosError(
    'Request failed',
    String(status),
    config,
    {},
    {
      status,
      statusText: '',
      headers: {},
      config,
      data: message ? { message } : {},
    }
  );
}

describe('toApiError', () => {
  it('keeps the message the API sent', () => {
    const error = toApiError(
      axiosErrorWith(409, 'Student is already enrolled in this class')
    );

    expect(error.message).toBe('Student is already enrolled in this class');
    expect(error.kind).toBe('conflict');
    expect(error.status).toBe(409);
  });

  it('maps status codes to a kind the UI can branch on', () => {
    expect(toApiError(axiosErrorWith(404)).kind).toBe('not_found');
    expect(toApiError(axiosErrorWith(400)).kind).toBe('validation');
    expect(toApiError(axiosErrorWith(500)).kind).toBe('server');
    expect(toApiError(axiosErrorWith(418)).kind).toBe('unknown');
  });

  it('falls back to a readable message when the API sends none', () => {
    const error = toApiError(axiosErrorWith(500));

    expect(error.message).toMatch(/server/i);
    expect(error.message).not.toMatch(/axios|500/i);
  });

  it('treats a response-less failure as a network error', () => {
    const config = { headers: new AxiosHeaders() };
    const networkFailure = new AxiosError('Network Error', 'ERR_NETWORK', config);

    const error = toApiError(networkFailure);

    expect(error.kind).toBe('network');
    expect(error.status).toBeNull();
  });

  it('passes an ApiError straight through', () => {
    const original = new ApiError('Boom', 'server', 503);

    expect(toApiError(original)).toBe(original);
  });

  it('wraps unknown throwables', () => {
    expect(toApiError('just a string').kind).toBe('unknown');
    expect(toApiError(new Error('render blew up')).message).toBe('render blew up');
  });
});

describe('ApiError.isRetryable', () => {
  it('is true only for failures that could succeed on a retry', () => {
    expect(new ApiError('x', 'network', null).isRetryable).toBe(true);
    expect(new ApiError('x', 'server', 500).isRetryable).toBe(true);
    expect(new ApiError('x', 'not_found', 404).isRetryable).toBe(false);
    expect(new ApiError('x', 'conflict', 409).isRetryable).toBe(false);
  });
});
