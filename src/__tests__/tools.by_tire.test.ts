import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listTireAspectRatios,
  listTireRimDiameters,
  listTireSectionWidths,
  searchByTire,
  searchModificationsByTire,
} from '../tools/by_tire.js';
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

describe('listTireAspectRatios', () => {
  it('returns aspect ratios on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [35, 40, 45, 55] }));
    const r = await listTireAspectRatios({});
    expect((r as { data: number[] }).data).toContain(45);
  });
  it('throws WheelSizeApiError on 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(500, 'Internal Server Error'));
    await expect(listTireAspectRatios({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listTireRimDiameters', () => {
  it('returns rim diameters on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [16, 17, 18] }));
    const r = await listTireRimDiameters({});
    expect((r as { data: number[] }).data).toContain(18);
  });
  it('throws WheelSizeApiError on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(404, 'Not Found'));
    await expect(listTireRimDiameters({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listTireSectionWidths', () => {
  it('returns section widths on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [205, 225, 245] }));
    const r = await listTireSectionWidths({});
    expect((r as { data: number[] }).data).toContain(245);
  });
  it('throws WheelSizeApiError on 401', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(401, 'Unauthorized'));
    await expect(listTireSectionWidths({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('searchByTire', () => {
  it('returns vehicle list on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      ok({ data: [{ make: 'Audi', model: 'A4', year: 2020 }] }),
    );
    const r = await searchByTire({ section_width: 245, aspect_ratio: 45, rim_diameter: 18 });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });

  it('includes section_width, aspect_ratio, rim_diameter in URL', async () => {
    let url = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      url = input.toString();
      return ok({ data: [] });
    });
    await searchByTire({ section_width: 245, aspect_ratio: 45, rim_diameter: 18 });
    const params = new URL(url).searchParams;
    expect(params.get('section_width')).toBe('245');
    expect(params.get('aspect_ratio')).toBe('45');
    expect(params.get('rim_diameter')).toBe('18');
  });

  it('throws WheelSizeApiError on 429', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(429, 'Too Many Requests'));
    await expect(
      searchByTire({ section_width: 245, aspect_ratio: 45, rim_diameter: 18 }),
    ).rejects.toThrow(/Sandbox limit/);
  });
});

describe('searchModificationsByTire', () => {
  it('returns modifications on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      ok({ data: [{ trim: '2.0 TFSI', year: 2020 }] }),
    );
    const r = await searchModificationsByTire({
      make: 'audi', model: 'a4', section_width: 245, aspect_ratio: 45, rim_diameter: 18,
    });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(400, 'Bad Request'));
    await expect(
      searchModificationsByTire({
        make: 'audi', model: 'a4', section_width: 0, aspect_ratio: 0, rim_diameter: 0,
      }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});
