import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as z from 'zod';
import {
  searchClassifiedPackages,
  searchModificationsByClassifiedPackage,
  listClassifiedRims,
  searchClassifiedRims,
  searchModificationsByClassifiedRim,
  searchClassifiedTires,
  searchClassifiedPackagesInput,
} from '../tools/classified.js';
import { WheelSizeApiError } from '../api.js';

beforeEach(() => {
  process.env.WHEEL_SIZE_API_KEY = 'test-key';
  vi.restoreAllMocks();
});
afterEach(() => { delete process.env.WHEEL_SIZE_API_KEY; });

const BASE_RIM_ARGS = {
  bolt_pattern: '5x112',
  rim_diameter: 18,
  rim_width: 8.0,
  rim_offset: 39,
};

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

describe('searchClassifiedPackages', () => {
  it('returns package products on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [{ sku: 'PKG-001', name: 'Package A' }] }));
    const r = await searchClassifiedPackages({
      ...BASE_RIM_ARGS,
      section_width: 245,
      aspect_ratio: 45,
    });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(400, 'Bad Request'));
    await expect(
      searchClassifiedPackages({ ...BASE_RIM_ARGS, section_width: 245, aspect_ratio: 45 }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});

describe('searchModificationsByClassifiedPackage', () => {
  it('returns modifications on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [{ trim: '2.0 TFSI' }] }));
    const r = await searchModificationsByClassifiedPackage({
      ...BASE_RIM_ARGS,
      section_width: 245,
      aspect_ratio: 45,
      make: 'audi',
      model: 'a4',
      generation: 'b9',
    });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(401, 'Unauthorized'));
    await expect(
      searchModificationsByClassifiedPackage({
        ...BASE_RIM_ARGS, section_width: 245, aspect_ratio: 45,
        make: 'audi', model: 'a4', generation: 'b9',
      }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listClassifiedRims', () => {
  it('returns rim products on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [{ sku: 'RIM-001' }] }));
    const r = await listClassifiedRims(BASE_RIM_ARGS);
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(500, 'Internal Server Error'));
    await expect(listClassifiedRims(BASE_RIM_ARGS)).rejects.toThrow(WheelSizeApiError);
  });
});

describe('searchClassifiedRims', () => {
  it('returns rim search results on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [{ sku: 'RIM-002' }] }));
    const r = await searchClassifiedRims(BASE_RIM_ARGS);
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 403 with hint', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(403, 'Forbidden'));
    await expect(searchClassifiedRims(BASE_RIM_ARGS)).rejects.toThrow(/WHEEL_SIZE_API_KEY/);
  });
});

describe('searchModificationsByClassifiedRim', () => {
  it('returns modifications on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [{ trim: 'Sport' }] }));
    const r = await searchModificationsByClassifiedRim({
      ...BASE_RIM_ARGS, make: 'audi', model: 'a4', generation: 'b9',
    });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(404, 'Not Found'));
    await expect(
      searchModificationsByClassifiedRim({
        ...BASE_RIM_ARGS, make: 'unknown', model: 'unknown', generation: 'unknown',
      }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});

describe('searchClassifiedTires', () => {
  it('returns tyre products on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [{ sku: 'TIRE-001', brand: 'Michelin' }] }));
    const r = await searchClassifiedTires({ section_width: 245, aspect_ratio: 45, rim_diameter: 18 });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(400, 'Bad Request'));
    await expect(
      searchClassifiedTires({ section_width: 0, aspect_ratio: 0, rim_diameter: 0 }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});

// ---- Boundary validation (Zod schema) ----

describe('classified schema boundary validation', () => {
  const schema = z.object(searchClassifiedPackagesInput);
  const validBase = {
    bolt_pattern: '5x112',
    rim_diameter: 18,
    rim_width: 8.0,
    rim_offset: 35,
    section_width: 245,
    aspect_ratio: 45,
  };

  it('rejects negative fd', () => {
    expect(schema.safeParse({ ...validBase, fd: -1 }).success).toBe(false);
  });
  it('rejects zero fd', () => {
    expect(schema.safeParse({ ...validBase, fd: 0 }).success).toBe(false);
  });
  it('accepts positive fd', () => {
    expect(schema.safeParse({ ...validBase, fd: 14 }).success).toBe(true);
  });
  it('rejects negative fs_poke', () => {
    expect(schema.safeParse({ ...validBase, fs_poke: -1 }).success).toBe(false);
  });
  it('accepts fs_poke of 0', () => {
    expect(schema.safeParse({ ...validBase, fs_poke: 0 }).success).toBe(true);
  });
  it('rejects negative bs_push', () => {
    expect(schema.safeParse({ ...validBase, bs_push: -1 }).success).toBe(false);
  });
  it('accepts bs_push of 0', () => {
    expect(schema.safeParse({ ...validBase, bs_push: 0 }).success).toBe(true);
  });
  it('rejects negative diameter_range', () => {
    expect(schema.safeParse({ ...validBase, diameter_range: -1 }).success).toBe(false);
  });
  it('accepts diameter_range of 0', () => {
    expect(schema.safeParse({ ...validBase, diameter_range: 0 }).success).toBe(true);
  });
  it('accepts diameter_range of 1', () => {
    expect(schema.safeParse({ ...validBase, diameter_range: 1 }).success).toBe(true);
  });
});
