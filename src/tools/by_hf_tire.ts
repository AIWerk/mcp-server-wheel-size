import * as z from 'zod';
import { fetchApi } from '../api.js';

// High-flotation (HF) tyre tools for pickup trucks and off-road vehicles.
// HF tyre sizes use imperial notation: overall_diameter x section_width R rim_diameter (e.g. 33x12.5R15).
// IMPORTANT: section_width here is in INCHES (not mm as in standard by_tire tools).

const overallDiameterOpt = z
  .number()
  .optional()
  .describe(
    'Overall outside diameter of the inflated tyre in inches (e.g. 33.0 for a 33-inch tyre). ' +
    'Part of the HF size notation: OD x SW R RD (e.g. 33x12.5R15). ' +
    'Use list-hf-tire-overall-diameters to enumerate valid values.',
  );
const overallDiameterReq = z
  .number()
  .describe(
    'Overall outside diameter of the inflated tyre in inches (e.g. 33.0). Required. ' +
    'Part of the HF size notation: OD x SW R RD (e.g. 33x12.5R15).',
  );
const sectionWidthInchesOpt = z
  .number()
  .optional()
  .describe(
    'Tyre section width in INCHES (e.g. 12.5). ' +
    'Note: this differs from standard by_tire tools where section_width is in mm. ' +
    'Use list-hf-tire-section-widths to enumerate valid values.',
  );
const sectionWidthInchesReq = z
  .number()
  .describe(
    'Tyre section width in INCHES (e.g. 12.5). Required. ' +
    'Note: this differs from standard by_tire tools where section_width is in mm.',
  );
const rimDiameterReq = z
  .number()
  .describe('Rim diameter in inches (e.g. 15). Required. Use list-hf-tire-rim-diameters to enumerate valid values.');
const rimDiameterOpt = rimDiameterReq.optional();
const region = z
  .string()
  .optional()
  .describe('Market region code (e.g. "usdm", "eudm"). Get codes from list-regions.');
const limitOpt = z
  .number()
  .int()
  .min(0)
  .max(100)
  .optional()
  .describe('Maximum results to return (0-100).');
const offsetOpt = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Number of results to skip for pagination.');
const makeReq = z.string().describe('Manufacturer slug (e.g. "ford", "ram"). Get slugs from list-makes.');
const modelReq = z.string().describe('Model slug (e.g. "f-150", "1500"). Get slugs from list-models.');

// list-hf-tire-overall-diameters

export const listHfTireOverallDiametersInput = {
  region,
};

export type ListHfTireOverallDiametersArgs = { region?: string };

export async function listHfTireOverallDiameters(args: ListHfTireOverallDiametersArgs) {
  return fetchApi('/by_hf_tire/od/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-hf-tire-rim-diameters

export const listHfTireRimDiametersInput = {
  overall_diameter: overallDiameterOpt,
  section_width: sectionWidthInchesOpt,
  region,
};

export type ListHfTireRimDiametersArgs = {
  overall_diameter?: number;
  section_width?: number;
  region?: string;
};

export async function listHfTireRimDiameters(args: ListHfTireRimDiametersArgs) {
  return fetchApi('/by_hf_tire/rd/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-hf-tire-section-widths

export const listHfTireSectionWidthsInput = {
  overall_diameter: overallDiameterOpt,
  region,
};

export type ListHfTireSectionWidthsArgs = { overall_diameter?: number; region?: string };

export async function listHfTireSectionWidths(args: ListHfTireSectionWidthsArgs) {
  return fetchApi('/by_hf_tire/sw/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-by-hf-tire

export const searchByHfTireInput = {
  overall_diameter: overallDiameterReq,
  section_width: sectionWidthInchesReq,
  rim_diameter: rimDiameterReq,
  region,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchByHfTireArgs = {
  overall_diameter: number;
  section_width: number;
  rim_diameter: number;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function searchByHfTire(args: SearchByHfTireArgs) {
  return fetchApi('/by_hf_tire/search/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-modifications-by-hf-tire

export const searchModificationsByHfTireInput = {
  overall_diameter: overallDiameterReq,
  section_width: sectionWidthInchesReq,
  rim_diameter: rimDiameterReq,
  make: makeReq,
  model: modelReq,
  region,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchModificationsByHfTireArgs = {
  overall_diameter: number;
  section_width: number;
  rim_diameter: number;
  make: string;
  model: string;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function searchModificationsByHfTire(args: SearchModificationsByHfTireArgs) {
  return fetchApi('/by_hf_tire/search/modifications/', args as Record<string, string | number | boolean | undefined | null>);
}
