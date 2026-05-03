import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { wheelSpecMetadata } from '../tools/spec.js';
import { WheelSizeApiError } from '../api.js';

beforeEach(() => {
  process.env.WHEEL_SIZE_API_KEY = 'test-key';
  vi.restoreAllMocks();
});
afterEach(() => { delete process.env.WHEEL_SIZE_API_KEY; });

describe('wheelSpecMetadata', () => {
  it('returns geometry metadata on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          rim_diameter: 18,
          rim_width: 8.0,
          computed: { backspace: 142.5, frontspace: 60.5 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const r = await wheelSpecMetadata({ rim_diameter: 18, rim_width: 8.0, rim_offset: 39 });
    expect((r as { rim_diameter: number }).rim_diameter).toBe(18);
  });

  it('returns data with all-optional args, no required params', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ computed: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    // All args optional. empty args must work
    const r = await wheelSpecMetadata({});
    expect(r).toBeDefined();
  });

  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Bad request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(wheelSpecMetadata({ rim_diameter: -1 })).rejects.toThrow(WheelSizeApiError);
  });
});
