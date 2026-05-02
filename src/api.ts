// Wheel-Size.com API v2 client.
// Auth: user_key query parameter (NOT a header — a common pitfall).

export class WheelSizeConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WheelSizeConfigError';
  }
}

export class WheelSizeApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'WheelSizeApiError';
  }
}

export class WheelSizeTimeoutError extends Error {
  constructor(
    public readonly timeoutMs: number,
    public readonly path: string,
  ) {
    super(`Wheel-Size API GET ${path} timed out after ${timeoutMs}ms`);
    this.name = 'WheelSizeTimeoutError';
  }
}

export class WheelSizeNetworkError extends Error {
  constructor(
    public readonly path: string,
    public readonly cause: unknown,
  ) {
    const causeMsg = cause instanceof Error ? cause.message : String(cause);
    super(`Wheel-Size API GET ${path} network error: ${causeMsg}`);
    this.name = 'WheelSizeNetworkError';
  }
}

const BASE_URL = 'https://api.wheel-size.com/v2';
const DEFAULT_TIMEOUT_MS = 30_000;

export function getApiKey(): string {
  const key = process.env.WHEEL_SIZE_API_KEY;
  if (!key) {
    throw new WheelSizeConfigError(
      'WHEEL_SIZE_API_KEY environment variable is required. Get a key at https://developer.wheel-size.com/',
    );
  }
  return key;
}

function getTimeoutMs(): number {
  const raw = process.env.WHEEL_SIZE_API_TIMEOUT_MS;
  if (raw === undefined || raw === '') return DEFAULT_TIMEOUT_MS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new WheelSizeConfigError(
      `WHEEL_SIZE_API_TIMEOUT_MS must be a positive integer (got "${raw}").`,
    );
  }
  return n;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export function buildUrl(path: string, query: Query = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  // Auth: user_key as query param — NOT a header
  url.searchParams.set('user_key', getApiKey());
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function warnRateLimit(res: Response, path: string): void {
  const remaining = res.headers.get('X-RateLimit-Remaining');
  const limit = res.headers.get('X-RateLimit-Limit');
  if (remaining !== null && limit !== null) {
    const rem = Number(remaining);
    const lim = Number(limit);
    if (Number.isFinite(rem) && Number.isFinite(lim) && lim > 0 && rem / lim < 0.1) {
      console.error(
        `[mcp-server-wheel-size] rate-limit warning: ${rem}/${lim} remaining on ${path}`,
      );
    }
  }
}

export async function fetchApi<T>(path: string, query: Query = {}): Promise<T> {
  const url = buildUrl(path, query);
  const timeoutMs = getTimeoutMs();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new WheelSizeTimeoutError(timeoutMs, path);
    }
    throw new WheelSizeNetworkError(path, err);
  } finally {
    clearTimeout(timer);
  }

  warnRateLimit(res, path);

  if (!res.ok) {
    let body: unknown = null;
    const ct = res.headers.get('content-type') ?? '';
    try {
      body = ct.includes('application/json') ? await res.json() : await res.text();
    } catch { /* ignore parse error */ }

    let hint = '';
    if (res.status === 401 || res.status === 403) {
      hint = ' Check WHEEL_SIZE_API_KEY validity at https://developer.wheel-size.com/';
    } else if (res.status === 429) {
      hint = ' Sandbox limit is 300 calls/day; upgrade plan or wait until tomorrow.';
    }

    throw new WheelSizeApiError(
      res.status,
      res.statusText,
      body,
      `Wheel-Size API GET ${path} failed: ${res.status} ${res.statusText}.${hint}`,
    );
  }

  return (await res.json()) as T;
}
