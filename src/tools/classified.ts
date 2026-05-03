import * as z from 'zod';
import { fetchApi } from '../api.js';

// Classified / e-commerce product lookup tools.
// These endpoints match real aftermarket rim and tyre products (SKUs) to vehicle fitment data.
// All search tools return product listings with compatibility info.

// Shared field builders

const boltPatternReq = z
  .string()
  .describe(
    'Bolt pattern (PCD) as stud-count × circle-diameter in mm (e.g. "5x112", "4x100"). ' +
    'Required. Use list-rim-bolt-patterns to enumerate valid values.',
  );
const rimDiameterReq = z
  .number()
  .describe('Rim diameter in inches (e.g. 18). Required.');
const rimWidthReq = z
  .number()
  .describe('Rim width in inches from bead seat to bead seat (e.g. 8.0). Required.');
const rimOffsetReq = z
  .number()
  .describe('Rim offset (ET) in mm (e.g. 35). Distance from mounting face to rim centre-line. Required.');
const sectionWidthMmReq = z
  .number()
  .describe('Tyre section width in mm (e.g. 245). Required.');
const aspectRatioReq = z
  .number()
  .int()
  .describe('Tyre aspect ratio as a percentage integer (e.g. 45). Required.');
const cbOpt = z
  .number()
  .optional()
  .describe('Centre bore diameter in mm (e.g. 66.5). Narrows results to matching bore size.');
const fdOpt = z
  .number()
  .optional()
  .describe('Fastener thread diameter in mm. Filters by lug-bolt thread size.');
const fsPoke = z
  .number()
  .int()
  .optional()
  .describe(
    'Frontspace poke tolerance in mm (default 2). 0 = exact or safer only, no stick-out past the fender. ' +
    'Positive values allow increasing amounts of wheel poke.',
  );
const bsPush = z
  .number()
  .int()
  .optional()
  .describe(
    'Backspace push tolerance in mm (default 2). 0 = exact or safer only, no inward encroachment. ' +
    'Positive values allow more clearance margin.',
  );
const odTolerance = z
  .number()
  .min(0)
  .max(0.05)
  .optional()
  .describe(
    'Overall diameter tolerance as a decimal fraction (0-0.05, default 0.01 = 1%). ' +
    'Controls how closely the product OD must match the vehicle spec.',
  );
const owTolerance = z
  .number()
  .min(0)
  .max(0.03)
  .optional()
  .describe('Overall width tolerance as a decimal fraction (0-0.03, default 0).');
const diameterRange = z
  .number()
  .int()
  .optional()
  .describe(
    'Widen rim diameter search by ±N inches (default 0 = exact match only). ' +
    'E.g. diameterRange=1 on an 18-inch search also returns 17 and 19-inch options.',
  );
const sortOpt = z
  .string()
  .optional()
  .describe('Sort order: "name" (A-Z by make/model), "fitment" (closest frontspace delta), "load" (heaviest first).');
const limitOpt = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Maximum results to return.');
const offsetOpt = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Number of results to skip for pagination.');
const makeReq = z.string().describe('Manufacturer slug (e.g. "audi"). Get slugs from list-makes.');
const modelReq = z.string().describe('Model slug (e.g. "a4"). Get slugs from list-models.');
const generationReq = z
  .string()
  .describe('Generation slug (e.g. "b9"). Get slugs from list-generations.');

// search-classified-packages
// Matches wheel+tyre packages (rim+tyre combos sold together as a set) compatible with the given fitment spec.

export const searchClassifiedPackagesInput = {
  bolt_pattern: boltPatternReq,
  rim_diameter: rimDiameterReq,
  rim_width: rimWidthReq,
  rim_offset: rimOffsetReq,
  section_width: sectionWidthMmReq,
  aspect_ratio: aspectRatioReq,
  cb: cbOpt,
  fd: fdOpt,
  fs_poke: fsPoke,
  bs_push: bsPush,
  od_tolerance: odTolerance,
  ow_tolerance: owTolerance,
  diameter_range: diameterRange,
  sort: sortOpt,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchClassifiedPackagesArgs = {
  bolt_pattern: string;
  rim_diameter: number;
  rim_width: number;
  rim_offset: number;
  section_width: number;
  aspect_ratio: number;
  cb?: number;
  fd?: number;
  fs_poke?: number;
  bs_push?: number;
  od_tolerance?: number;
  ow_tolerance?: number;
  diameter_range?: number;
  sort?: string;
  limit?: number;
  offset?: number;
};

export async function searchClassifiedPackages(args: SearchClassifiedPackagesArgs) {
  return fetchApi('/classified/by_package/search/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-modifications-by-classified-package
// Like search-classified-packages but filtered to a specific vehicle make/model/generation.

export const searchModificationsByClassifiedPackageInput = {
  bolt_pattern: boltPatternReq,
  rim_diameter: rimDiameterReq,
  rim_width: rimWidthReq,
  rim_offset: rimOffsetReq,
  section_width: sectionWidthMmReq,
  aspect_ratio: aspectRatioReq,
  make: makeReq,
  model: modelReq,
  generation: generationReq,
  cb: cbOpt,
  fd: fdOpt,
  fs_poke: fsPoke,
  bs_push: bsPush,
  od_tolerance: odTolerance,
  ow_tolerance: owTolerance,
  diameter_range: diameterRange,
  sort: sortOpt,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchModificationsByClassifiedPackageArgs = {
  bolt_pattern: string;
  rim_diameter: number;
  rim_width: number;
  rim_offset: number;
  section_width: number;
  aspect_ratio: number;
  make: string;
  model: string;
  generation: string;
  cb?: number;
  fd?: number;
  fs_poke?: number;
  bs_push?: number;
  od_tolerance?: number;
  ow_tolerance?: number;
  diameter_range?: number;
  sort?: string;
  limit?: number;
  offset?: number;
};

export async function searchModificationsByClassifiedPackage(
  args: SearchModificationsByClassifiedPackageArgs,
) {
  return fetchApi('/classified/by_package/search/modifications/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-classified-rims
// Lists aftermarket rim products compatible with the given fitment spec.

export const listClassifiedRimsInput = {
  bolt_pattern: boltPatternReq,
  rim_diameter: rimDiameterReq,
  rim_width: rimWidthReq,
  rim_offset: rimOffsetReq,
  cb: cbOpt,
  fd: fdOpt,
  fs_poke: fsPoke,
  bs_push: bsPush,
  od_tolerance: odTolerance,
  ow_tolerance: owTolerance,
  diameter_range: diameterRange,
  sort: sortOpt,
  limit: limitOpt,
  offset: offsetOpt,
};

export type ListClassifiedRimsArgs = {
  bolt_pattern: string;
  rim_diameter: number;
  rim_width: number;
  rim_offset: number;
  cb?: number;
  fd?: number;
  fs_poke?: number;
  bs_push?: number;
  od_tolerance?: number;
  ow_tolerance?: number;
  diameter_range?: number;
  sort?: string;
  limit?: number;
  offset?: number;
};

export async function listClassifiedRims(args: ListClassifiedRimsArgs) {
  return fetchApi('/classified/by_rim/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-classified-rims
// Searches aftermarket rim products by fitment spec, returning vehicle compatibility.

export const searchClassifiedRimsInput = listClassifiedRimsInput;
export type SearchClassifiedRimsArgs = ListClassifiedRimsArgs;

export async function searchClassifiedRims(args: SearchClassifiedRimsArgs) {
  return fetchApi('/classified/by_rim/search/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-modifications-by-classified-rim
// Like search-classified-rims but filtered to a specific vehicle make/model/generation.

export const searchModificationsByClassifiedRimInput = {
  bolt_pattern: boltPatternReq,
  rim_diameter: rimDiameterReq,
  rim_width: rimWidthReq,
  rim_offset: rimOffsetReq,
  make: makeReq,
  model: modelReq,
  generation: generationReq,
  cb: cbOpt,
  fd: fdOpt,
  fs_poke: fsPoke,
  bs_push: bsPush,
  od_tolerance: odTolerance,
  ow_tolerance: owTolerance,
  diameter_range: diameterRange,
  sort: sortOpt,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchModificationsByClassifiedRimArgs = {
  bolt_pattern: string;
  rim_diameter: number;
  rim_width: number;
  rim_offset: number;
  make: string;
  model: string;
  generation: string;
  cb?: number;
  fd?: number;
  fs_poke?: number;
  bs_push?: number;
  od_tolerance?: number;
  ow_tolerance?: number;
  diameter_range?: number;
  sort?: string;
  limit?: number;
  offset?: number;
};

export async function searchModificationsByClassifiedRim(
  args: SearchModificationsByClassifiedRimArgs,
) {
  return fetchApi('/classified/by_rim/search/modifications/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-classified-tires
// Searches aftermarket tyre products by tyre spec (section_width/aspect_ratio/rim_diameter).

export const searchClassifiedTiresInput = {
  section_width: sectionWidthMmReq,
  aspect_ratio: aspectRatioReq,
  rim_diameter: rimDiameterReq,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchClassifiedTiresArgs = {
  section_width: number;
  aspect_ratio: number;
  rim_diameter: number;
  limit?: number;
  offset?: number;
};

export async function searchClassifiedTires(args: SearchClassifiedTiresArgs) {
  return fetchApi('/classified/by_tire/search/', args as Record<string, string | number | boolean | undefined | null>);
}
