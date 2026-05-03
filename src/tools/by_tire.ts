import * as z from 'zod';
import { fetchApi } from '../api.js';

// Standard (metric) tyre lookup tools.
// section_width is in mm; rim_diameter is in inches; aspect_ratio is a percentage integer.

const sectionWidthMm = z
  .number()
  .describe(
    'Tyre section width in mm (e.g. 245). ' +
    'Use list-tire-section-widths to enumerate valid values.',
  );
const sectionWidthMmOpt = sectionWidthMm.optional();
const aspectRatioReq = z
  .number()
  .int()
  .describe(
    'Aspect ratio as a percentage integer (e.g. 45 for a 45-series tyre). ' +
    'Use list-tire-aspect-ratios to enumerate valid values.',
  );
const aspectRatioOpt = aspectRatioReq.optional();
const rimDiameterReq = z
  .number()
  .describe('Rim diameter in inches (e.g. 18). Use list-tire-rim-diameters to enumerate valid values.');
const rimDiameterOpt = rimDiameterReq.optional();
const region = z
  .string()
  .optional()
  .describe('Market region code (e.g. "eudm", "usdm"). Get codes from list-regions.');
const limitOpt = z
  .number()
  .int()
  .min(0)
  .max(100)
  .optional()
  .describe('Maximum results to return (0–100).');
const offsetOpt = z
  .number()
  .int()
  .min(0)
  .optional()
  .describe('Number of results to skip for pagination.');

// list-tire-aspect-ratios

export const listTireAspectRatiosInput = {
  section_width: sectionWidthMmOpt,
  region,
};

export type ListTireAspectRatiosArgs = { section_width?: number; region?: string };

export async function listTireAspectRatios(args: ListTireAspectRatiosArgs) {
  return fetchApi('/by_tire/ar/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-tire-rim-diameters

export const listTireRimDiametersInput = {
  section_width: sectionWidthMmOpt,
  aspect_ratio: aspectRatioOpt,
  region,
};

export type ListTireRimDiametersArgs = {
  section_width?: number;
  aspect_ratio?: number;
  region?: string;
};

export async function listTireRimDiameters(args: ListTireRimDiametersArgs) {
  return fetchApi('/by_tire/rd/', args as Record<string, string | number | boolean | undefined | null>);
}

// list-tire-section-widths

export const listTireSectionWidthsInput = {
  region,
};

export type ListTireSectionWidthsArgs = { region?: string };

export async function listTireSectionWidths(args: ListTireSectionWidthsArgs) {
  return fetchApi('/by_tire/sw/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-by-tire

export const searchByTireInput = {
  section_width: sectionWidthMm,
  aspect_ratio: aspectRatioReq,
  rim_diameter: rimDiameterReq,
  region,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchByTireArgs = {
  section_width: number;
  aspect_ratio: number;
  rim_diameter: number;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function searchByTire(args: SearchByTireArgs) {
  return fetchApi('/by_tire/search/', args as Record<string, string | number | boolean | undefined | null>);
}

// search-modifications-by-tire

export const searchModificationsByTireInput = {
  make: z.string().describe('Manufacturer slug (e.g. "audi"). Get slugs from list-makes.'),
  model: z.string().describe('Model slug (e.g. "a4"). Get slugs from list-models.'),
  section_width: sectionWidthMm,
  aspect_ratio: aspectRatioReq,
  rim_diameter: rimDiameterReq,
  region,
  limit: limitOpt,
  offset: offsetOpt,
};

export type SearchModificationsByTireArgs = {
  make: string;
  model: string;
  section_width: number;
  aspect_ratio: number;
  rim_diameter: number;
  region?: string;
  limit?: number;
  offset?: number;
};

export async function searchModificationsByTire(args: SearchModificationsByTireArgs) {
  return fetchApi('/by_tire/search/modifications/', args as Record<string, string | number | boolean | undefined | null>);
}
