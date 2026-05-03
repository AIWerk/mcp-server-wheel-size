import * as z from 'zod';
import { fetchApi } from '../api.js';

// list-regions

export const listRegionsInput = {};

export async function listRegions(_args: Record<string, never>) {
  return fetchApi('/regions/');
}

// list-makes

export const listMakesInput = {
  region: z.string().describe(
    'Market region code (e.g., "eudm" for Europe, "usdm" for North America, "jdm" for Japan). ' +
    'Get the full list from list-regions.',
  ),
};

export type ListMakesArgs = { region: string };

export async function listMakes(args: ListMakesArgs) {
  return fetchApi('/makes/', { region: args.region });
}

// list-years

export const listYearsInput = {
  make: z.string().describe(
    'Manufacturer slug (e.g., "audi", "ford", "toyota"). Get slugs from list-makes.',
  ),
};

export type ListYearsArgs = { make: string };

export async function listYears(args: ListYearsArgs) {
  return fetchApi('/years/', { make: args.make });
}

// list-models

export const listModelsInput = {
  make: z.string().describe(
    'Manufacturer slug (e.g., "audi", "ford"). Get slugs from list-makes.',
  ),
  year: z.number().int().min(1900).max(2100).describe(
    '4-digit model year 1900-2100 (e.g., 2020). Get valid years from list-years.',
  ),
};

export type ListModelsArgs = { make: string; year: number };

export async function listModels(args: ListModelsArgs) {
  return fetchApi('/models/', { make: args.make, year: args.year });
}

// list-generations

export const listGenerationsInput = {
  make: z.string().describe(
    'Manufacturer slug (e.g., "audi", "bmw"). Get slugs from list-makes.',
  ),
  model: z.string().describe(
    'Model slug (e.g., "a4", "3-series"). Get slugs from list-models.',
  ),
  year: z.number().int().min(1900).max(2100).describe(
    '4-digit model year 1900-2100 (e.g., 2020). Get valid years from list-years.',
  ),
};

export type ListGenerationsArgs = { make: string; model: string; year: number };

export async function listGenerations(args: ListGenerationsArgs) {
  return fetchApi('/generations/', { make: args.make, model: args.model, year: args.year });
}

// list-modifications

export const listModificationsInput = {
  make: z.string().describe(
    'Manufacturer slug (e.g., "audi", "bmw"). Get slugs from list-makes.',
  ),
  model: z.string().describe(
    'Model slug (e.g., "a4", "3-series"). Get slugs from list-models.',
  ),
  year: z.number().int().min(1900).max(2100).describe(
    '4-digit model year 1900-2100 (e.g., 2020). Get valid years from list-years.',
  ),
  generation: z.string().describe(
    'Generation slug (e.g., "b9"). Get slugs from list-generations.',
  ),
};

export type ListModificationsArgs = {
  make: string;
  model: string;
  year: number;
  generation: string;
};

export async function listModifications(args: ListModificationsArgs) {
  return fetchApi('/modifications/', {
    make: args.make,
    model: args.model,
    year: args.year,
    generation: args.generation,
  });
}
