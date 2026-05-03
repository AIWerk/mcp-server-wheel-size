import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as z from 'zod';
import {
  listRimBoltPatterns,
  listRimCentreBores,
  listRimOffsets,
  listRimDiameters,
  listRimWidths,
  searchByRim,
  searchModificationsByRim,
  listRimCentresBoresInput,
  searchByRimInput,
  searchModificationsByRimInput,
} from '../tools/by_rim.js';
import { WheelSizeApiError } from '../api.js';

beforeEach(() => {
  process.env.WHEEL_SIZE_API_KEY = 'test-key';
  vi.restoreAllMocks();
});
afterEach(() => { delete process.env.WHEEL_SIZE_API_KEY; });

function ok(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
function err(status: number, statusText: string) {
  return new Response(JSON.stringify({ detail: statusText }), {
    status,
    statusText,
    headers: { 'content-type': 'application/json' },
  });
}

describe('listRimBoltPatterns', () => {
  it('returns data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: ['5x112', '5x114.3'] }));
    const r = await listRimBoltPatterns({});
    expect((r as { data: string[] }).data).toContain('5x112');
  });
  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(400, 'Bad Request'));
    await expect(listRimBoltPatterns({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listRimCentreBores', () => {
  it('returns data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [57.1, 66.5] }));
    const r = await listRimCentreBores({});
    expect((r as { data: number[] }).data).toContain(66.5);
  });
  it('throws WheelSizeApiError on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(404, 'Not Found'));
    await expect(listRimCentreBores({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listRimOffsets', () => {
  it('returns data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [35, 39, 45] }));
    const r = await listRimOffsets({});
    expect((r as { data: number[] }).data).toContain(35);
  });
  it('throws WheelSizeApiError on 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(500, 'Internal Server Error'));
    await expect(listRimOffsets({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listRimDiameters', () => {
  it('returns data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [17, 18, 19] }));
    const r = await listRimDiameters({});
    expect((r as { data: number[] }).data).toContain(18);
  });
  it('throws WheelSizeApiError on 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(401, 'Unauthorized'));
    await expect(listRimDiameters({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listRimWidths', () => {
  it('returns data on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [7.5, 8.0, 8.5] }));
    const r = await listRimWidths({});
    expect((r as { data: number[] }).data).toContain(8.0);
  });
  it('throws WheelSizeApiError on 403', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(403, 'Forbidden'));
    await expect(listRimWidths({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('searchByRim', () => {
  it('returns vehicle list on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      ok({ data: [{ make: 'Audi', model: 'A4', year: 2020 }] }),
    );
    const r = await searchByRim({ bolt_pattern: '5x112' });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });

  it('includes bolt_pattern and user_key in URL', async () => {
    let url = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      url = input.toString();
      return ok({ data: [] });
    });
    await searchByRim({ bolt_pattern: '5x112', rim_diameter: 18 });
    const params = new URL(url).searchParams;
    expect(params.get('bolt_pattern')).toBe('5x112');
    expect(params.get('rim_diameter')).toBe('18');
    expect(params.get('user_key')).toBe('test-key');
  });

  it('throws WheelSizeApiError on 429', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(429, 'Too Many Requests'));
    await expect(searchByRim({ bolt_pattern: '5x112' })).rejects.toThrow(/Sandbox limit/);
  });
});

describe('searchModificationsByRim', () => {
  it('returns modifications on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      ok({ data: [{ trim: '2.0 TFSI', year: 2020 }] }),
    );
    const r = await searchModificationsByRim({ make: 'audi', model: 'a4', bolt_pattern: '5x112' });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(400, 'Bad Request'));
    await expect(
      searchModificationsByRim({ make: 'audi', model: 'a4', bolt_pattern: '5x112' }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});

// ---- Boundary validation (Zod schema) ----

describe('by_rim schema boundary validation', () => {
  const searchSchema = z.object(searchByRimInput);

  it('rejects negative rim_diameter', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_diameter: -1 });
    expect(r.success).toBe(false);
  });
  it('rejects zero rim_diameter', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_diameter: 0 });
    expect(r.success).toBe(false);
  });
  it('accepts positive rim_diameter', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_diameter: 18 });
    expect(r.success).toBe(true);
  });
  it('rejects negative rim_width', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_width: -0.5 });
    expect(r.success).toBe(false);
  });
  it('accepts ET offset in valid range (positive)', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_offset: 35 });
    expect(r.success).toBe(true);
  });
  it('accepts ET offset in valid range (negative deep-dish)', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_offset: -25 });
    expect(r.success).toBe(true);
  });
  it('rejects ET offset below -100', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_offset: -101 });
    expect(r.success).toBe(false);
  });
  it('rejects ET offset above 100', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', rim_offset: 101 });
    expect(r.success).toBe(false);
  });
  it('rejects non-positive cb', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', cb: 0 });
    expect(r.success).toBe(false);
  });
  it('rejects limit of 0', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', limit: 0 });
    expect(r.success).toBe(false);
  });
  it('rejects limit above 100', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', limit: 101 });
    expect(r.success).toBe(false);
  });
  it('accepts limit of 1', () => {
    const r = searchSchema.safeParse({ bolt_pattern: '5x112', limit: 1 });
    expect(r.success).toBe(true);
  });
});

// ---- Mutex constraints (handler level) ----

describe('listRimCentreBores mutex', () => {
  it('throws when rim_offset combined with rim_offset_min', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    await expect(
      listRimCentreBores({ rim_offset: 35, rim_offset_min: 20 }),
    ).rejects.toThrow('Cannot combine rim_offset');
  });
  it('throws when rim_offset combined with rim_offset_max', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    await expect(
      listRimCentreBores({ rim_offset: 35, rim_offset_max: 50 }),
    ).rejects.toThrow('Cannot combine rim_offset');
  });
  it('does not throw when only rim_offset is set', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    await expect(listRimCentreBores({ rim_offset: 35 })).resolves.toBeDefined();
  });
});

describe('searchByRim mutex', () => {
  it('throws when rim_offset combined with rim_offset_min', async () => {
    await expect(
      searchByRim({ bolt_pattern: '5x112', rim_offset: 35, rim_offset_min: 20 }),
    ).rejects.toThrow('Cannot combine rim_offset');
  });
  it('throws when cb combined with cb_min', async () => {
    await expect(
      searchByRim({ bolt_pattern: '5x112', cb: 66.5, cb_min: 60 }),
    ).rejects.toThrow('Cannot combine cb');
  });
  it('throws when cb combined with cb_max', async () => {
    await expect(
      searchByRim({ bolt_pattern: '5x112', cb: 66.5, cb_max: 70 }),
    ).rejects.toThrow('Cannot combine cb');
  });
  it('does not throw with cb range only', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    await expect(searchByRim({ bolt_pattern: '5x112', cb_min: 60, cb_max: 70 })).resolves.toBeDefined();
  });
});

describe('searchModificationsByRim mutex', () => {
  it('throws when rim_offset combined with rim_offset_max', async () => {
    await expect(
      searchModificationsByRim({ make: 'audi', model: 'a4', bolt_pattern: '5x112', rim_offset: 35, rim_offset_max: 50 }),
    ).rejects.toThrow('Cannot combine rim_offset');
  });
  it('throws when cb combined with cb_min', async () => {
    await expect(
      searchModificationsByRim({ make: 'audi', model: 'a4', bolt_pattern: '5x112', cb: 66.5, cb_min: 60 }),
    ).rejects.toThrow('Cannot combine cb');
  });
});
