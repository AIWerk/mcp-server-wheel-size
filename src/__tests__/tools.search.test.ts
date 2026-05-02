import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchByModel, wheelUpsteps } from '../tools/search.js';
import { WheelSizeApiError, WheelSizeTimeoutError, WheelSizeNetworkError } from '../api.js';

beforeEach(() => {
  process.env.WHEEL_SIZE_API_KEY = 'test-api-key';
  vi.restoreAllMocks();
});

afterEach(() => {
  delete process.env.WHEEL_SIZE_API_KEY;
});

const SAMPLE_FITMENT_RESPONSE = {
  data: [
    {
      make: 'Audi',
      model: 'A4',
      year: 2020,
      trim: '2.0 TFSI quattro',
      wheels: [
        {
          front: {
            tire: '245/45R18',
            rim: '8Jx18 ET39',
            bolt_pattern: '5x112',
            pcd: 5,
            centre_bore: 66.5,
          },
          rear: {
            tire: '245/45R18',
            rim: '8Jx18 ET39',
            bolt_pattern: '5x112',
            pcd: 5,
            centre_bore: 66.5,
          },
        },
      ],
      is_oem: true,
    },
  ],
};

// --- search-by-model ---

describe('searchByModel', () => {
  it('returns fitment data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(SAMPLE_FITMENT_RESPONSE), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await searchByModel({ make: 'audi', model: 'a4', year: 2020, region: 'eudm' });
    const typed = result as typeof SAMPLE_FITMENT_RESPONSE;
    expect(typed.data).toHaveLength(1);
    expect(typed.data[0].wheels[0].front.bolt_pattern).toBe('5x112');
  });

  it('returns empty data array on make+region mismatch (not an error)', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await searchByModel({ make: 'audi', model: 'a4', year: 2020, region: 'jdm' });
    expect((result as { data: unknown[] }).data).toHaveLength(0);
  });

  it('includes make, model, year, region as query params', async () => {
    let capturedUrl = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    await searchByModel({ make: 'ford', model: 'f-150', year: 2021, region: 'usdm' });
    const params = new URL(capturedUrl).searchParams;
    expect(params.get('make')).toBe('ford');
    expect(params.get('model')).toBe('f-150');
    expect(params.get('year')).toBe('2021');
    expect(params.get('region')).toBe('usdm');
    expect(params.get('user_key')).toBe('test-api-key');
  });

  it('throws WheelSizeApiError with 401 hint on unauthorized', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Authentication credentials not provided.' }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(
      searchByModel({ make: 'audi', model: 'a4', year: 2020, region: 'eudm' }),
    ).rejects.toThrow(/WHEEL_SIZE_API_KEY/);
  });

  it('throws WheelSizeApiError with 429 sandbox hint', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Too Many Requests', { status: 429, statusText: 'Too Many Requests' }),
    );
    await expect(
      searchByModel({ make: 'audi', model: 'a4', year: 2020, region: 'eudm' }),
    ).rejects.toThrow(/Sandbox limit/);
  });

  it('throws WheelSizeTimeoutError on fetch abort', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
    );
    await expect(
      searchByModel({ make: 'audi', model: 'a4', year: 2020, region: 'eudm' }),
    ).rejects.toThrow(WheelSizeTimeoutError);
  });

  it('throws WheelSizeNetworkError on connection failure', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(
      searchByModel({ make: 'audi', model: 'a4', year: 2020, region: 'eudm' }),
    ).rejects.toThrow(WheelSizeNetworkError);
  });
});

// --- wheel-upsteps ---

describe('wheelUpsteps', () => {
  it('returns upstep suggestions on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { diameter: 19, tire: '245/40R19', rim: '8.5Jx19 ET35', bolt_pattern: '5x112' },
          ],
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    const result = await wheelUpsteps({
      make: 'audi',
      model: 'a4',
      year: 2020,
      region: 'eudm',
    });
    expect((result as { data: unknown[] }).data).toHaveLength(1);
  });

  it('includes all required query params including user_key', async () => {
    let capturedUrl = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    await wheelUpsteps({ make: 'bmw', model: '3-series', year: 2019, region: 'eudm' });
    const params = new URL(capturedUrl).searchParams;
    expect(params.get('make')).toBe('bmw');
    expect(params.get('model')).toBe('3-series');
    expect(params.get('year')).toBe('2019');
    expect(params.get('region')).toBe('eudm');
    expect(params.get('user_key')).toBe('test-api-key');
  });

  it('throws WheelSizeApiError on non-OK response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(
      wheelUpsteps({ make: 'unknown', model: 'unknown', year: 2020, region: 'eudm' }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});
