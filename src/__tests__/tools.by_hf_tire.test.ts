import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listHfTireOverallDiameters,
  listHfTireRimDiameters,
  listHfTireSectionWidths,
  searchByHfTire,
  searchModificationsByHfTire,
} from '../tools/by_hf_tire.js';
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

describe('listHfTireOverallDiameters', () => {
  it('returns diameters on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [31.0, 33.0, 35.0] }));
    const r = await listHfTireOverallDiameters({});
    expect((r as { data: number[] }).data).toContain(33.0);
  });
  it('throws WheelSizeApiError on 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(500, 'Internal Server Error'));
    await expect(listHfTireOverallDiameters({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listHfTireRimDiameters', () => {
  it('returns rim diameters on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [15, 16, 17] }));
    const r = await listHfTireRimDiameters({});
    expect((r as { data: number[] }).data).toContain(15);
  });
  it('throws WheelSizeApiError on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(404, 'Not Found'));
    await expect(listHfTireRimDiameters({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('listHfTireSectionWidths', () => {
  it('returns section widths in inches on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(ok({ data: [10.5, 12.5, 14.5] }));
    const r = await listHfTireSectionWidths({});
    // section_width is in INCHES for HF tyres
    expect((r as { data: number[] }).data).toContain(12.5);
  });
  it('throws WheelSizeApiError on 403', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(403, 'Forbidden'));
    await expect(listHfTireSectionWidths({})).rejects.toThrow(WheelSizeApiError);
  });
});

describe('searchByHfTire', () => {
  it('returns vehicle list on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      ok({ data: [{ make: 'Ford', model: 'F-150', year: 2020 }] }),
    );
    const r = await searchByHfTire({ overall_diameter: 33.0, section_width: 12.5, rim_diameter: 15 });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });

  it('passes overall_diameter, section_width (inches), rim_diameter in URL', async () => {
    let url = '';
    vi.spyOn(global, 'fetch').mockImplementation(async (input) => {
      url = input.toString();
      return ok({ data: [] });
    });
    await searchByHfTire({ overall_diameter: 33.0, section_width: 12.5, rim_diameter: 15 });
    const params = new URL(url).searchParams;
    expect(params.get('overall_diameter')).toBe('33');
    expect(params.get('section_width')).toBe('12.5');
    expect(params.get('rim_diameter')).toBe('15');
  });

  it('throws WheelSizeApiError on 429', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(429, 'Too Many Requests'));
    await expect(
      searchByHfTire({ overall_diameter: 33.0, section_width: 12.5, rim_diameter: 15 }),
    ).rejects.toThrow(/Sandbox limit/);
  });
});

describe('searchModificationsByHfTire', () => {
  it('returns modifications on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      ok({ data: [{ trim: 'XLT 4WD', year: 2020 }] }),
    );
    const r = await searchModificationsByHfTire({
      overall_diameter: 33.0, section_width: 12.5, rim_diameter: 15, make: 'ford', model: 'f-150',
    });
    expect((r as { data: unknown[] }).data).toHaveLength(1);
  });
  it('throws WheelSizeApiError on 400', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(err(400, 'Bad Request'));
    await expect(
      searchModificationsByHfTire({
        overall_diameter: 0, section_width: 0, rim_diameter: 0, make: '', model: '',
      }),
    ).rejects.toThrow(WheelSizeApiError);
  });
});
