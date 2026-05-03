import { describe, it, expect } from 'vitest';
import { isCliEntry, toolError } from '../server.js';
import {
  WheelSizeApiError,
  WheelSizeTimeoutError,
  WheelSizeNetworkError,
  WheelSizeConfigError,
} from '../api.js';

describe('isCliEntry', () => {
  it('returns false when argv1 is undefined', () => {
    expect(isCliEntry('file:///some/path.js', undefined)).toBe(false);
  });

  it('returns false when paths differ', () => {
    expect(isCliEntry('file:///a/server.js', '/b/server.js')).toBe(false);
  });
});

describe('toolError', () => {
  it('formats WheelSizeConfigError', () => {
    const result = toolError(new WheelSizeConfigError('WHEEL_SIZE_API_KEY is required'));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Configuration error/);
  });

  it('formats WheelSizeTimeoutError', () => {
    const result = toolError(new WheelSizeTimeoutError(30000, '/regions/'));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Timeout/);
    expect(result.content[0].text).toMatch(/WHEEL_SIZE_API_TIMEOUT_MS/);
  });

  it('formats WheelSizeNetworkError', () => {
    const result = toolError(new WheelSizeNetworkError('/regions/', new Error('ECONNREFUSED')));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Network error/);
  });

  it('formats WheelSizeApiError with body', () => {
    const result = toolError(
      new WheelSizeApiError(401, 'Unauthorized', { detail: 'bad key' }, '401 Unauthorized'),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/401/);
    expect(result.content[0].text).toMatch(/bad key/);
  });

  it('surfaces 401/403 hint from api.ts message, hint must reach the agent', () => {
    const hint = 'Check WHEEL_SIZE_API_KEY validity at https://developer.wheel-size.com/';
    const msg = `Wheel-Size API GET /regions/ failed: 403 Forbidden. ${hint}`;
    const result = toolError(
      new WheelSizeApiError(403, 'Forbidden', null, msg),
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain(hint);
  });

  it('formats plain Error', () => {
    const result = toolError(new Error('something went wrong'));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('something went wrong');
  });

  it('formats unknown non-Error', () => {
    const result = toolError('raw string error');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('raw string error');
  });
});
