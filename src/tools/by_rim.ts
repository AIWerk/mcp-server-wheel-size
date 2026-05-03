import * as z from 'zod';
import { fetchApi } from '../api.js';

// Shared optional rim filter fields used across list-* enumeration tools
const rimDiameter = z
  .number()
  .positive()
  .optional()
  .describe('Rim diameter in inches (e.g. 18). Must be positive. Filters results to this diameter only.');
const rimWidth = z
  .number()
  .positive()
  .optional()
  .describe('Rim width in inches from bead seat to bead seat (e.g. 8.0). Must be positive.');
const rimOffsetExact = z
  .number()
  .min(-100)
  .max(100)
  .optional()
  .describe(
    'Exact rim offset (ET) in mm, range -100 to 100 (e.g. 35). The distance between the wheel mounting surface and the centre-line of the rim. ' +
    'Do not combine with rim_offset_min/rim_offset_max.',
  );
const rimOffsetMin = z
  .number()
  .min(-100)
  .max(100)
  .optional()
  .describe('Minimum rim offset (ET) in mm, range -100 to 100. Use instead of rim_offset for a range query.');
const rimOffsetMax = z
  .number()
  .min(-100)
  .max(100)
  .optional()
  .describe('Maximum rim offset (ET) in mm, range -100 to 100. Use instead of rim_offset for a range query.');
const boltPatternOpt = z
  .string()
  .optional()
  .describe(
    'Bolt pattern (PCD) filter, expressed as stud-count × circle-diameter in mm (e.g. "5x112", "4x100"). ' +
    'Use list-rim-bolt-patterns to enumerate valid values.',
  );
const boltPatternReq = z
  .string()
  .describe(
    'Bolt pattern (PCD) expressed as stud-count × circle-diameter in mm (e.g. "5x112", "4x100"). ' +
    'Required. Use list-rim-bolt-patterns to enumerate valid values.',
  );
const cbExact = z
  .number()
  .positive()
  .optional()
  .describe('Centre bore diameter in mm (e.g. 66.5). Must be positive. Do not combine with cb_min/cb_max.');
const cbMin = z
  .number()
  .positive()
  .optional()
  .describe('Minimum centre bore in mm. Must be positive. Use instead of cb for a range query.');
const cbMax = z
  .number()
  .positive()
  .optional()
  .describe('Maximum centre bore in mm. Must be positive. Use instead of cb for a range query.');
const studHoles = z
  .number()
  .int()
  .optional()
  .describe('Number of stud holes (lug count, e.g. 4 or 5).');
const pcd = z
  .number()
  .optional()
  .describe('Pitch circle diameter in mm (e.g. 112). Part of bolt pattern. Use bolt_pattern when possible.');
const region = z
  .string()
  .optional()
  .describe('Market region code (e.g. "eudm", "usdm"). Get codes from list-regions.');
const limitOpt = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .describe('Maximum results to return (1-100). Defaults to API default when omitted.');
const offsetOpt = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Number of results to skip for pagination.');
const fd = z
  .number()
  .positive()
  .optional()
  .describe('Fastener thread diameter in mm. Must be positive. Narrows results to wheels with matching lug-bolt thread size.');
const rimDiameterMin = z
  .number()
  .positive()
  .optional()
  .describe('Minimum rim diameter in inches. Must be positive. Use instead of rim_diameter for a range query.');
const rimDiameterMax = z
  .number()
  .positive()
  .optional()
  .describe('Maximum rim diameter in inches. Must be positive. Use instead of rim_diameter for a range query.');
const rimWidthMin = z
  .number()
  .positive()
  .optional()
  .describe('Minimum rim width in inches. Must be positive. Use instead of rim_width for a range query.');
const rimWidthMax = z
  .number()
  .positive()
  .optional()
  .describe('Maximum rim width in inches. Must be positive. Use instead of rim_width for a range query.');

// list-rim-bolt-patterns

export const listRimBoltPatternsInput = {
  rim_diameter: rimDiameter,
  rim_width: rimWidth,
  rim_offset_min: rimOffsetMin,
  rim_offset_max: rimOffsetMax,
  cb_min: cbMin,
  cb_max: cbMax,
  stud_holes: studHoles,
  pcd,
  region,
};

export type ListRimBoltPatternsArgs = {
  rim_diameter?: number;
  rim_width?: number;
  rim_offset_min?: number;
  rim_offset_max?: number;
  cb_min?: number;
  cb_max?: number;
  stud_holes?: number;
  pcd?: number;
  region?: string;
};

export async function listRimBoltPatterns(args: ListRimBoltPatternsArgs) {
  return fetchApi('/by_rim/bp/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-rim-centre-bores

export const listRimCentresBoresInput = {
  rim_diameter: rimDiameter,
  rim_width: rimWidth,
  rim_offset: rimOffsetExact,
  rim_offset_min: rimOffsetMin,
  rim_offset_max: rimOffsetMax,
  bolt_pattern: boltPatternOpt,
  region,
};

export type ListRimCentreBoresArgs = {
  rim_diameter?: number;
  rim_width?: number;
  rim_offset?: number;
  rim_offset_min?: number;
  rim_offset_max?: number;
  bolt_pattern?: string;
  region?: string;
};

export async function listRimCentreBores(args: ListRimCentreBoresArgs) {
  const hasExact = args.rim_offset !== undefined;
  const hasRange = args.rim_offset_min !== undefined || args.rim_offset_max !== undefined;
  if (hasExact && hasRange) {
    throw new Error('Cannot combine rim_offset (exact) with rim_offset_min/max (range). Use one or the other.');
  }
  return fetchApi('/by_rim/cb/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-rim-offsets

export const listRimOffsetsInput = {
  rim_diameter: rimDiameter,
  rim_width: rimWidth,
  bolt_pattern: boltPatternOpt,
  region,
};

export type ListRimOffsetsArgs = {
  rim_diameter?: number;
  rim_width?: number;
  bolt_pattern?: string;
  region?: string;
};

export async function listRimOffsets(args: ListRimOffsetsArgs) {
  return fetchApi('/by_rim/of/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-rim-diameters

export const listRimDiametersInput = {
  bolt_pattern: boltPatternOpt,
  region,
};

export type ListRimDiametersArgs = { bolt_pattern?: string; region?: string };

export async function listRimDiameters(args: ListRimDiametersArgs) {
  return fetchApi('/by_rim/rd/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-rim-widths

export const listRimWidthsInput = {
  rim_diameter: rimDiameter,
  bolt_pattern: boltPatternOpt,
  region,
};

export type ListRimWidthsArgs = { rim_diameter?: number; bolt_pattern?: string; region?: string };

export async function listRimWidths(args: ListRimWidthsArgs) {
  return fetchApi('/by_rim/rw/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-by-rim

export const searchByRimInput = {
  bolt_pattern: boltPatternReq,
  rim_diameter: rimDiameter,
  rim_diameter_min: rimDiameterMin,
  rim_diameter_max: rimDiameterMax,
  rim_width: rimWidth,
  rim_width_min: rimWidthMin,
  rim_width_max: rimWidthMax,
  rim_offset: rimOffsetExact,
  rim_offset_min: rimOffsetMin,
  rim_offset_max: rimOffsetMax,
  cb: cbExact,
  cb_min: cbMin,
  cb_max: cbMax,
  fd,
  region,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchByRimArgs = {
  bolt_pattern: string;
  rim_diameter?: number;
  rim_diameter_min?: number;
  rim_diameter_max?: number;
  rim_width?: number;
  rim_width_min?: number;
  rim_width_max?: number;
  rim_offset?: number;
  rim_offset_min?: number;
  rim_offset_max?: number;
  cb?: number;
  cb_min?: number;
  cb_max?: number;
  fd?: number;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function searchByRim(args: SearchByRimArgs) {
  const hasExactOffset = args.rim_offset !== undefined;
  const hasRangeOffset = args.rim_offset_min !== undefined || args.rim_offset_max !== undefined;
  if (hasExactOffset && hasRangeOffset) {
    throw new Error('Cannot combine rim_offset (exact) with rim_offset_min/max (range). Use one or the other.');
  }
  const hasExactCb = args.cb !== undefined;
  const hasRangeCb = args.cb_min !== undefined || args.cb_max !== undefined;
  if (hasExactCb && hasRangeCb) {
    throw new Error('Cannot combine cb (exact) with cb_min/cb_max (range). Use one or the other.');
  }
  return fetchApi('/by_rim/search/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-modifications-by-rim

export const searchModificationsByRimInput = {
  make: z.string().describe('Manufacturer slug (e.g. "audi"). Get slugs from list-makes.'),
  model: z.string().describe('Model slug (e.g. "a4"). Get slugs from list-models.'),
  bolt_pattern: boltPatternReq,
  rim_diameter: rimDiameter,
  rim_diameter_min: rimDiameterMin,
  rim_diameter_max: rimDiameterMax,
  rim_width: rimWidth,
  rim_width_min: rimWidthMin,
  rim_width_max: rimWidthMax,
  rim_offset: rimOffsetExact,
  rim_offset_min: rimOffsetMin,
  rim_offset_max: rimOffsetMax,
  cb: cbExact,
  cb_min: cbMin,
  cb_max: cbMax,
  region,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchModificationsByRimArgs = {
  make: string;
  model: string;
  bolt_pattern: string;
  rim_diameter?: number;
  rim_diameter_min?: number;
  rim_diameter_max?: number;
  rim_width?: number;
  rim_width_min?: number;
  rim_width_max?: number;
  rim_offset?: number;
  rim_offset_min?: number;
  rim_offset_max?: number;
  cb?: number;
  cb_min?: number;
  cb_max?: number;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function searchModificationsByRim(args: SearchModificationsByRimArgs) {
  const hasExactOffset = args.rim_offset !== undefined;
  const hasRangeOffset = args.rim_offset_min !== undefined || args.rim_offset_max !== undefined;
  if (hasExactOffset && hasRangeOffset) {
    throw new Error('Cannot combine rim_offset (exact) with rim_offset_min/max (range). Use one or the other.');
  }
  const hasExactCb = args.cb !== undefined;
  const hasRangeCb = args.cb_min !== undefined || args.cb_max !== undefined;
  if (hasExactCb && hasRangeCb) {
    throw new Error('Cannot combine cb (exact) with cb_min/cb_max (range). Use one or the other.');
  }
  return fetchApi('/by_rim/search/modifications/', args as Record<string, string | number | boolean | undefined | null>);
}
