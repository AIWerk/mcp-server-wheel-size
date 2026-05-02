import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listRegions,
  listMakes,
  listYears,
  listModels,
  listGenerations,
  listModifications,
} from '../tools/enumeration.js';
import { WheelSizeApiError, WheelSizeConfigError, buildUrl } from '../api.js';

const MOCK_KEY = 'test-api-key';

beforeEach(() => {
  process.env.WHEEL_SIZE_API_KEY = MOCK_KEY;
  vi.restoreAllMocks();
});

afterEach(() => {
  delete process.env.WHEEL_SIZE_API_KEY;
});

// --- auth pitfall: user_key must be a query param ---

describe('auth: user_key in URL search params', () => {
  it('includes user_key as a query parameter, NOT as a header', () => {
    const url = buildUrl('/regions/');
    const parsed = new URL(url);
    expect(parsed.searchParams.get('user_key')).toBe(MOCK_KEY);
  });

  it('throws WheelSizeConfigError when WHEEL_SIZE_API_KEY is missing', () => {
    delete process.env.WHEEL_SIZE_API_KEY;
    expect(() => buildUrl('/regions/')).toThrow(WheelSizeConfigError);
  });
});

// --- list-regions ---

describe('listRegions', () => {
  it('returns region data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [{ slug: 'eudm', name: 'Europe' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await listRegions({} as Record<string, never>);
    expect((result as { data: unknown[] }).data).toHaveLength(1);
  });

  it('throws WheelSizeApiError on 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Authentication credentials not provided.' }), {
        status: 401,
        statusText: 'Unauthorized',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(listRegions({} as Record<string, never>)).rejects.toThrow(WheelSizeApiError);
  });

  it('throws WheelSizeApiError on 429 with correct hint in message', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Too Many Requests', {
        status: 429,
        statusText: 'Too Many Requests',
      }),
    );
    await expect(listRegions({} as Record<string, never>)).rejects.toThrow(/Sandbox limit/);
  });
});

// --- list-makes ---

describe('listMakes', () => {
  it('returns makes for a region on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [{ slug: 'audi', name: 'Audi' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await listMakes({ region: 'eudm' });
    expect((result as { data: unknown[] }).data).toHaveLength(1);
  });

  it('includes region in the request URL', async () => {
    let capturedUrl = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    await listMakes({ region: 'usdm' });
    expect(new URL(capturedUrl).searchParams.get('region')).toBe('usdm');
  });

  it('throws WheelSizeApiError on 403', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Forbidden' }), {
        status: 403,
        statusText: 'Forbidden',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(listMakes({ region: 'eudm' })).rejects.toThrow(WheelSizeApiError);
  });
});

// --- list-years ---

describe('listYears', () => {
  it('returns years array on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [2020, 2021, 2022] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await listYears({ make: 'audi' });
    expect((result as { data: number[] }).data).toContain(2020);
  });

  it('throws WheelSizeApiError on 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      }),
    );
    await expect(listYears({ make: 'audi' })).rejects.toThrow(WheelSizeApiError);
  });
});

// --- list-models ---

describe('listModels', () => {
  it('returns models on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [{ slug: 'a4', name: 'A4' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await listModels({ make: 'audi', year: 2020 });
    expect((result as { data: unknown[] }).data).toHaveLength(1);
  });

  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Bad request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(listModels({ make: '', year: 0 })).rejects.toThrow(WheelSizeApiError);
  });
});

// --- list-generations ---

describe('listGenerations', () => {
  it('returns generations on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [{ slug: 'b9', name: 'B9 (2015–2022)' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const result = await listGenerations({ make: 'audi', model: 'a4', year: 2020 });
    expect((result as { data: unknown[] }).data).toHaveLength(1);
  });

  it('throws WheelSizeApiError on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Not found' }), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
      }),
    );
    await expect(
      listGenerations({ make: 'unknown', model: 'unknown', year: 1900 }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});

// --- list-modifications ---

describe('listModifications', () => {
  it('returns modifications on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ data: [{ slug: '2.0-tfsi-quattro', name: '2.0 TFSI quattro' }] }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );
    const result = await listModifications({
      make: 'audi',
      model: 'a4',
      year: 2020,
      generation: 'b9',
    });
    expect((result as { data: unknown[] }).data).toHaveLength(1);
  });

  it('throws WheelSizeApiError on non-OK response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('Service Unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
      }),
    );
    await expect(
      listModifications({ make: 'audi', model: 'a4', year: 2020, generation: 'b9' }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});
