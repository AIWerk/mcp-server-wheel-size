import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as z from 'zod';
import { wheelSpecMetadata, wheelSpecMetadataInput } from '../tools/spec.js';
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

// ---- Boundary validation (Zod schema) ----

describe('wheelSpecMetadata schema boundary validation', () => {
  const schema = z.object(wheelSpecMetadataInput);

  it('rejects negative rim_diameter', () => {
    expect(schema.safeParse({ rim_diameter: -1 }).success).toBe(false);
  });
  it('rejects zero rim_diameter', () => {
    expect(schema.safeParse({ rim_diameter: 0 }).success).toBe(false);
  });
  it('accepts positive rim_diameter', () => {
    expect(schema.safeParse({ rim_diameter: 18 }).success).toBe(true);
  });
  it('rejects ET offset below -100', () => {
    expect(schema.safeParse({ rim_offset: -101 }).success).toBe(false);
  });
  it('rejects ET offset above 100', () => {
    expect(schema.safeParse({ rim_offset: 101 }).success).toBe(false);
  });
  it('accepts negative ET offset within range', () => {
    expect(schema.safeParse({ rim_offset: -25 }).success).toBe(true);
  });
  it('rejects aspect_ratio of 0', () => {
    expect(schema.safeParse({ aspect_ratio: 0 }).success).toBe(false);
  });
  it('rejects aspect_ratio above 100', () => {
    expect(schema.safeParse({ aspect_ratio: 101 }).success).toBe(false);
  });
  it('accepts aspect_ratio of 45', () => {
    expect(schema.safeParse({ aspect_ratio: 45 }).success).toBe(true);
  });
  it('rejects non-positive overall_diameter', () => {
    expect(schema.safeParse({ overall_diameter: 0 }).success).toBe(false);
  });
  it('rejects non-positive cb', () => {
    expect(schema.safeParse({ cb: -1 }).success).toBe(false);
  });
});

// ---- Mutex constraints (handler level) ----

describe('wheelSpecMetadata mutex', () => {
  it('throws when overall_diameter combined with section_width', async () => {
    await expect(
      wheelSpecMetadata({ overall_diameter: 33, section_width: 245 }),
    ).rejects.toThrow('Cannot combine overall_diameter');
  });
  it('throws when overall_diameter combined with aspect_ratio', async () => {
    await expect(
      wheelSpecMetadata({ overall_diameter: 33, aspect_ratio: 75 }),
    ).rejects.toThrow('Cannot combine overall_diameter');
  });
  it('throws when overall_diameter combined with both metric fields', async () => {
    await expect(
      wheelSpecMetadata({ overall_diameter: 33, section_width: 245, aspect_ratio: 75 }),
    ).rejects.toThrow('Cannot combine overall_diameter');
  });
  it('does not throw with only overall_diameter', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ computed: {} }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    await expect(wheelSpecMetadata({ overall_diameter: 33 })).resolves.toBeDefined();
  });
  it('does not throw with only metric fields', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ computed: {} }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    await expect(wheelSpecMetadata({ section_width: 245, aspect_ratio: 45 })).resolves.toBeDefined();
  });
});
