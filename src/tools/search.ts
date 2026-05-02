import * as z from 'zod';
import { fetchApi } from '../api.js';

// search-by-model — primary fitment lookup tool

export const searchByModelInput = {
  make: z.string().describe(
    'Manufacturer slug from list-makes (e.g., "audi", "ford"). Region-dependent — slugs can differ by market.',
  ),
  model: z.string().describe(
    'Model slug from list-models (e.g., "a4", "f-150"). Use list-models to get valid slugs for the given make+year.',
  ),
  year: z.number().int().describe(
    '4-digit model year (e.g., 2020). Use list-years to enumerate valid years for the given make.',
  ),
  region: z.string().describe(
    'Market code from list-regions (e.g., "usdm" for North America, "eudm" for Europe, "jdm" for Japan). ' +
    'OEM wheel specs differ by market — always specify the correct region. ' +
    'An empty result (data: []) means no data for this make+region combo, not an error.',
  ),
};

export type SearchByModelArgs = {
  make: string;
  model: string;
  year: number;
  region: string;
};

export async function searchByModel(args: SearchByModelArgs) {
  return fetchApi('/search/by_model/', {
    make: args.make,
    model: args.model,
    year: args.year,
    region: args.region,
  });
}

// wheel-upsteps — aftermarket fitment upgrade suggestions

export const wheelUpstepsInput = {
  make: z.string().describe(
    'Manufacturer slug from list-makes (e.g., "audi", "ford").',
  ),
  model: z.string().describe(
    'Model slug from list-models (e.g., "a4", "f-150").',
  ),
  year: z.number().int().describe(
    '4-digit model year (e.g., 2020).',
  ),
  region: z.string().describe(
    'Market code from list-regions (e.g., "usdm", "eudm"). ' +
    'Upstep suggestions are region-specific due to different OEM baseline specs. ' +
    'Key fitment terms: PCD (bolt pattern, e.g., 5x112), offset (ET value in mm), ' +
    'centre bore (CB in mm), tyre section width and aspect ratio.',
  ),
};

export type WheelUpstepsArgs = {
  make: string;
  model: string;
  year: number;
  region: string;
};

export async function wheelUpsteps(args: WheelUpstepsArgs) {
  return fetchApi('/upsteps/', {
    make: args.make,
    model: args.model,
    year: args.year,
    region: args.region,
  });
}
