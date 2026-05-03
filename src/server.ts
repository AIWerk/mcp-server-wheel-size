#!/usr/bin/env node
// Wheel-Size.com API MCP server: 32 read-only tools for vehicle wheel and tyre fitment data.

import { realpathSync } from 'fs';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { fileURLToPath } from 'node:url';

import {
  WheelSizeApiError,
  WheelSizeTimeoutError,
  WheelSizeNetworkError,
  WheelSizeConfigError,
} from './api.js';
import { VERSION } from './version.js';
import {
  listRegions, listRegionsInput,
  listMakes, listMakesInput,
  listYears, listYearsInput,
  listModels, listModelsInput,
  listGenerations, listGenerationsInput,
  listModifications, listModificationsInput,
} from './tools/enumeration.js';
import {
  searchByModel, searchByModelInput,
  wheelUpsteps, wheelUpstepsInput,
} from './tools/search.js';
import {
  listRimBoltPatterns, listRimBoltPatternsInput,
  listRimCentreBores, listRimCentresBoresInput,
  listRimOffsets, listRimOffsetsInput,
  listRimDiameters, listRimDiametersInput,
  listRimWidths, listRimWidthsInput,
  searchByRim, searchByRimInput,
  searchModificationsByRim, searchModificationsByRimInput,
} from './tools/by_rim.js';
import {
  listTireAspectRatios, listTireAspectRatiosInput,
  listTireRimDiameters, listTireRimDiametersInput,
  listTireSectionWidths, listTireSectionWidthsInput,
  searchByTire, searchByTireInput,
  searchModificationsByTire, searchModificationsByTireInput,
} from './tools/by_tire.js';
import {
  listHfTireOverallDiameters, listHfTireOverallDiametersInput,
  listHfTireRimDiameters, listHfTireRimDiametersInput,
  listHfTireSectionWidths, listHfTireSectionWidthsInput,
  searchByHfTire, searchByHfTireInput,
  searchModificationsByHfTire, searchModificationsByHfTireInput,
} from './tools/by_hf_tire.js';
import {
  searchClassifiedPackages, searchClassifiedPackagesInput,
  searchModificationsByClassifiedPackage, searchModificationsByClassifiedPackageInput,
  listClassifiedRims, listClassifiedRimsInput,
  searchClassifiedRims, searchClassifiedRimsInput,
  searchModificationsByClassifiedRim, searchModificationsByClassifiedRimInput,
  searchClassifiedTires, searchClassifiedTiresInput,
} from './tools/classified.js';
import {
  wheelSpecMetadata, wheelSpecMetadataInput,
} from './tools/spec.js';

function toolSuccess(data: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function toolError(error: unknown) {
  let message: string;
  if (error instanceof WheelSizeTimeoutError) {
    message = `Timeout: ${error.message}. Raise WHEEL_SIZE_API_TIMEOUT_MS or retry.`;
  } else if (error instanceof WheelSizeNetworkError) {
    message = `Network error: ${error.message}. Check connectivity.`;
  } else if (error instanceof WheelSizeConfigError) {
    message = `Configuration error: ${error.message}`;
  } else if (error instanceof WheelSizeApiError) {
    const body =
      error.body === null || error.body === undefined
        ? ''
        : `, body: ${JSON.stringify(error.body)}`;
    message = `${error.message}${body}`;
  } else if (error instanceof Error) {
    message = error.message;
  } else {
    message = String(error);
  }
  return {
    isError: true,
    content: [{ type: 'text' as const, text: message }],
  };
}

function wrap<TArgs, TResult>(fn: (args: TArgs) => Promise<TResult>) {
  return async (args: TArgs) => {
    try {
      return toolSuccess(await fn(args));
    } catch (err) {
      return toolError(err);
    }
  };
}

export function createServer() {
  const server = new McpServer({
    name: '@aiwerk/mcp-server-wheel-size',
    version: VERSION,
  });

  // ---- Enumeration (6) ----

  server.registerTool(
    'list-regions',
    {
      description:
        'List all available market region codes (e.g., "eudm" for Europe, "usdm" for North America, "jdm" for Japan). ' +
        'Region codes are required inputs for list-makes, search-by-model, and wheel-upsteps. Start here when region is unknown.',
      inputSchema: listRegionsInput,
      annotations: { title: 'List Regions', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listRegions),
  );

  server.registerTool(
    'list-makes',
    {
      description:
        'List all vehicle manufacturers (makes) available in a given market region. ' +
        'Returns slugs used as the "make" input for subsequent tools. ' +
        'Make availability is region-dependent, the same brand may have different slugs across markets.',
      inputSchema: listMakesInput,
      annotations: { title: 'List Makes', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listMakes),
  );

  server.registerTool(
    'list-years',
    {
      description:
        'List all model years available for a given manufacturer. ' +
        'Use the year values returned here as the "year" input for list-models, list-generations, and search-by-model.',
      inputSchema: listYearsInput,
      annotations: { title: 'List Years', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listYears),
  );

  server.registerTool(
    'list-models',
    {
      description:
        'List all vehicle models for a given make and year. ' +
        'Returns slugs used as the "model" input for list-generations, list-modifications, and search-by-model.',
      inputSchema: listModelsInput,
      annotations: { title: 'List Models', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listModels),
  );

  server.registerTool(
    'list-generations',
    {
      description:
        'List all body generations for a given make/model/year combination. ' +
        'Returns generation slugs (e.g., "b9" for Audi A4 2020) used as the "generation" input for list-modifications and classified tools.',
      inputSchema: listGenerationsInput,
      annotations: { title: 'List Generations', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listGenerations),
  );

  server.registerTool(
    'list-modifications',
    {
      description:
        'List all trim/engine modifications for a given make/model/year/generation. ' +
        'Useful for drilling into specific engine variants before querying fitment data.',
      inputSchema: listModificationsInput,
      annotations: { title: 'List Modifications', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listModifications),
  );

  // ---- Search by model (2) ----

  server.registerTool(
    'search-by-model',
    {
      description:
        'Look up OEM and aftermarket wheel/tyre fitment specs for a specific vehicle by make, model, year, and region. ' +
        'Returns per-trim fitment data including: tyre size (e.g., "245/45R18"), rim spec (e.g., "8Jx18 ET39"), ' +
        'bolt pattern / PCD (e.g., "5x112"), centre bore (CB in mm), and whether the fitment is OEM or aftermarket. ' +
        'This is the primary tool for fitment lookups. ' +
        'An empty data array means no fitment data exists for this make+region combination. Not an API error.',
      inputSchema: searchByModelInput,
      annotations: { title: 'Search by Model', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchByModel),
  );

  server.registerTool(
    'wheel-upsteps',
    {
      description:
        'Get aftermarket wheel upsize (plus-sizing) suggestions for a vehicle. ' +
        'Returns larger rim diameter options that maintain overall tyre diameter within acceptable tolerance. ' +
        'Key fitment terms returned: PCD (bolt pattern), offset (ET in mm), centre bore (CB in mm), ' +
        'section width, aspect ratio. Use this to recommend wheel upgrades while preserving speedometer accuracy.',
      inputSchema: wheelUpstepsInput,
      annotations: { title: 'Wheel Upsteps', readOnlyHint: true, openWorldHint: true },
    },
    wrap(wheelUpsteps),
  );

  // ---- By rim: reverse lookup (7) ----

  server.registerTool(
    'list-rim-bolt-patterns',
    {
      description:
        'List all bolt patterns (PCD) available in the database, optionally filtered by rim dimensions and centre bore range. ' +
        'Bolt pattern format: stud-count × circle-diameter in mm (e.g. "5x112"). ' +
        'Use this to discover valid bolt_pattern values before calling search-by-rim.',
      inputSchema: listRimBoltPatternsInput,
      annotations: { title: 'List Rim Bolt Patterns', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listRimBoltPatterns),
  );

  server.registerTool(
    'list-rim-centre-bores',
    {
      description:
        'List all centre bore (CB) values available, optionally filtered by rim dimensions, offset range, and bolt pattern. ' +
        'Centre bore is the diameter of the hole in the wheel centre in mm (e.g. 66.5). ' +
        'Use this to discover valid cb values for search-by-rim.',
      inputSchema: listRimCentresBoresInput,
      annotations: { title: 'List Rim Centre Bores', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listRimCentreBores),
  );

  server.registerTool(
    'list-rim-offsets',
    {
      description:
        'List all rim offset (ET) values available, optionally filtered by rim diameter, width, and bolt pattern. ' +
        'Offset is the distance from the wheel mounting surface to the rim centre-line in mm (positive = hub-centric, negative = deep dish). ' +
        'Use this to discover valid rim_offset values.',
      inputSchema: listRimOffsetsInput,
      annotations: { title: 'List Rim Offsets', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listRimOffsets),
  );

  server.registerTool(
    'list-rim-diameters',
    {
      description:
        'List all rim diameters (in inches) available in the database, optionally filtered by bolt pattern and region. ' +
        'Use this to discover valid rim_diameter values before calling search-by-rim.',
      inputSchema: listRimDiametersInput,
      annotations: { title: 'List Rim Diameters', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listRimDiameters),
  );

  server.registerTool(
    'list-rim-widths',
    {
      description:
        'List all rim widths (in inches) available, optionally filtered by diameter and bolt pattern. ' +
        'Use this to discover valid rim_width values for search-by-rim.',
      inputSchema: listRimWidthsInput,
      annotations: { title: 'List Rim Widths', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listRimWidths),
  );

  server.registerTool(
    'search-by-rim',
    {
      description:
        'Find all vehicles compatible with a given rim specification. Reverse lookup: "which cars fit these rims?" ' +
        'Required: bolt_pattern (e.g. "5x112"). Optional: rim_diameter, rim_width, rim_offset (or range), centre bore (cb), fastener diameter (fd), region. ' +
        'Supports pagination with limit and offset. ' +
        'Returns vehicle make/model/year/trim combinations that accept this rim fitment.',
      inputSchema: searchByRimInput,
      annotations: { title: 'Search by Rim', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchByRim),
  );

  server.registerTool(
    'search-modifications-by-rim',
    {
      description:
        'Find specific trim/modification variants of a known make+model that are compatible with a given rim spec. ' +
        'Required: make, model, bolt_pattern. Optional: rim dimensions, offset, centre bore, region. ' +
        'More granular than search-by-rim. Use when you already know the vehicle and want to check trim-level fitment.',
      inputSchema: searchModificationsByRimInput,
      annotations: { title: 'Search Modifications by Rim', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchModificationsByRim),
  );

  // ---- By tyre: reverse lookup (5) ----

  server.registerTool(
    'list-tire-aspect-ratios',
    {
      description:
        'List all tyre aspect ratios available, optionally filtered by section width and region. ' +
        'Aspect ratio is the sidewall height as a percentage of section width (e.g. 45 in a 245/45R18). ' +
        'Use this to discover valid aspect_ratio values for search-by-tire.',
      inputSchema: listTireAspectRatiosInput,
      annotations: { title: 'List Tire Aspect Ratios', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listTireAspectRatios),
  );

  server.registerTool(
    'list-tire-rim-diameters',
    {
      description:
        'List all rim diameters (in inches) compatible with a given tyre section width and aspect ratio. ' +
        'Use this to discover valid rim_diameter values for search-by-tire.',
      inputSchema: listTireRimDiametersInput,
      annotations: { title: 'List Tire Rim Diameters', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listTireRimDiameters),
  );

  server.registerTool(
    'list-tire-section-widths',
    {
      description:
        'List all tyre section widths (in mm) available in the database, optionally filtered by region. ' +
        'Use this to discover valid section_width values for search-by-tire.',
      inputSchema: listTireSectionWidthsInput,
      annotations: { title: 'List Tire Section Widths', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listTireSectionWidths),
  );

  server.registerTool(
    'search-by-tire',
    {
      description:
        'Find all vehicles compatible with a given standard tyre size. Reverse lookup: "which cars fit 245/45R18?" ' +
        'Required: section_width (mm, e.g. 245), aspect_ratio (%, e.g. 45), rim_diameter (inches, e.g. 18). ' +
        'Optional: region, limit, offset. ' +
        'Returns vehicle make/model/year/trim combinations that accept this tyre fitment.',
      inputSchema: searchByTireInput,
      annotations: { title: 'Search by Tire', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchByTire),
  );

  server.registerTool(
    'search-modifications-by-tire',
    {
      description:
        'Find specific trim/modification variants of a known make+model compatible with a given tyre size. ' +
        'Required: make, model, section_width (mm), aspect_ratio (%), rim_diameter (inches). ' +
        'Optional: region, limit, offset. ' +
        'More granular than search-by-tire. Use when you already know the vehicle.',
      inputSchema: searchModificationsByTireInput,
      annotations: { title: 'Search Modifications by Tire', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchModificationsByTire),
  );

  // ---- By HF tyre (high-flotation / pickup/off-road) (5) ----

  server.registerTool(
    'list-hf-tire-overall-diameters',
    {
      description:
        'List all overall diameter values (inches) for high-flotation (HF) tyres, optionally filtered by region. ' +
        'HF tyres use the imperial size format: OD x SW R RD (e.g. 33x12.5R15). ' +
        'Common on pickup trucks and off-road vehicles. ' +
        'Use this to discover valid overall_diameter values for search-by-hf-tire.',
      inputSchema: listHfTireOverallDiametersInput,
      annotations: { title: 'List HF Tire Overall Diameters', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listHfTireOverallDiameters),
  );

  server.registerTool(
    'list-hf-tire-rim-diameters',
    {
      description:
        'List all rim diameters (inches) available for HF tyres, optionally filtered by overall diameter and section width. ' +
        'Use this to discover valid rim_diameter values for search-by-hf-tire.',
      inputSchema: listHfTireRimDiametersInput,
      annotations: { title: 'List HF Tire Rim Diameters', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listHfTireRimDiameters),
  );

  server.registerTool(
    'list-hf-tire-section-widths',
    {
      description:
        'List all section widths (in inches) for HF tyres, optionally filtered by overall diameter and region. ' +
        'Note: section_width is in INCHES for HF tyres (e.g. 12.5), unlike standard tyre tools where it is in mm.',
      inputSchema: listHfTireSectionWidthsInput,
      annotations: { title: 'List HF Tire Section Widths', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listHfTireSectionWidths),
  );

  server.registerTool(
    'search-by-hf-tire',
    {
      description:
        'Find all vehicles compatible with a given high-flotation (HF) tyre size. ' +
        'For pickup trucks and off-road vehicles. HF size format: OD x SW R RD (e.g. 33x12.5R15). ' +
        'Required: overall_diameter (inches), section_width (INCHES, not mm!), rim_diameter (inches). ' +
        'Optional: region, limit, offset.',
      inputSchema: searchByHfTireInput,
      annotations: { title: 'Search by HF Tire', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchByHfTire),
  );

  server.registerTool(
    'search-modifications-by-hf-tire',
    {
      description:
        'Find specific trim variants of a known make+model compatible with a given HF tyre size. ' +
        'Required: overall_diameter (inches), section_width (INCHES), rim_diameter (inches), make, model. ' +
        'Optional: region, limit, offset.',
      inputSchema: searchModificationsByHfTireInput,
      annotations: { title: 'Search Modifications by HF Tire', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchModificationsByHfTire),
  );

  // ---- Classified / e-commerce (6) ----

  server.registerTool(
    'search-classified-packages',
    {
      description:
        'Find aftermarket wheel+tyre package products (rim+tyre combos sold together) compatible with a given fitment spec. ' +
        'Required: bolt_pattern, rim_diameter (inches), rim_width (inches), rim_offset (ET mm), section_width (mm), aspect_ratio (%). ' +
        'Optional: cb (centre bore mm), fd (fastener diameter mm), fs_poke/bs_push (fitment tolerances mm), ' +
        'od_tolerance (decimal 0-0.05), ow_tolerance (decimal 0-0.03), diameter_range (+-inches), sort, limit, offset. ' +
        'Returns product listings with SKU and compatibility data.',
      inputSchema: searchClassifiedPackagesInput,
      annotations: { title: 'Search Classified Packages', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchClassifiedPackages),
  );

  server.registerTool(
    'search-modifications-by-classified-package',
    {
      description:
        'Find wheel+tyre package products compatible with a specific vehicle make/model/generation. ' +
        'Required: bolt_pattern, rim_diameter, rim_width, rim_offset, section_width, aspect_ratio, make, model, generation. ' +
        'Optional: tolerance and fitment parameters (same as search-classified-packages). ' +
        'Use when you need to verify package compatibility for a particular trim level.',
      inputSchema: searchModificationsByClassifiedPackageInput,
      annotations: { title: 'Search Modifications by Classified Package', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchModificationsByClassifiedPackage),
  );

  server.registerTool(
    'list-classified-rims',
    {
      description:
        'List aftermarket rim products compatible with a given rim fitment spec. ' +
        'Required: bolt_pattern, rim_diameter (inches), rim_width (inches), rim_offset (ET mm). ' +
        'Optional: cb, fd, fitment tolerances (fs_poke, bs_push, od_tolerance, ow_tolerance), diameter_range, sort, limit, offset. ' +
        'Returns rim product listings with SKU data.',
      inputSchema: listClassifiedRimsInput,
      annotations: { title: 'List Classified Rims', readOnlyHint: true, openWorldHint: true },
    },
    wrap(listClassifiedRims),
  );

  server.registerTool(
    'search-classified-rims',
    {
      description:
        'Search aftermarket rim products by fitment spec, returning vehicle compatibility info alongside the rim listings. ' +
        'Required: bolt_pattern, rim_diameter (inches), rim_width (inches), rim_offset (ET mm). ' +
        'Optional: cb, fd, fitment tolerances, diameter_range, sort, limit, offset. ' +
        'Similar to list-classified-rims but includes vehicle-fitment matching.',
      inputSchema: searchClassifiedRimsInput,
      annotations: { title: 'Search Classified Rims', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchClassifiedRims),
  );

  server.registerTool(
    'search-modifications-by-classified-rim',
    {
      description:
        'Find aftermarket rim products compatible with a specific vehicle make/model/generation. ' +
        'Required: bolt_pattern, rim_diameter, rim_width, rim_offset, make, model, generation. ' +
        'Optional: cb, fd, fitment tolerances, diameter_range, sort, limit, offset.',
      inputSchema: searchModificationsByClassifiedRimInput,
      annotations: { title: 'Search Modifications by Classified Rim', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchModificationsByClassifiedRim),
  );

  server.registerTool(
    'search-classified-tires',
    {
      description:
        'Search aftermarket tyre products by tyre size specification. ' +
        'Required: section_width (mm), aspect_ratio (%), rim_diameter (inches). ' +
        'Optional: limit, offset. ' +
        'Returns tyre product listings matching the given size.',
      inputSchema: searchClassifiedTiresInput,
      annotations: { title: 'Search Classified Tires', readOnlyHint: true, openWorldHint: true },
    },
    wrap(searchClassifiedTires),
  );

  // ---- Spec metadata (1) ----

  server.registerTool(
    'wheel-spec-metadata',
    {
      description:
        'Get computed geometry and population statistics for a given wheel/tyre specification. ' +
        'All fields optional. Provide as many as known for precise results. ' +
        'Returns geometry hints (backspace, frontspace, clearance estimates), population stats (how many vehicles use this spec), ' +
        'and optional human-readable fitment hints when hints=true. ' +
        'Useful for explaining fitment math to users or validating a spec before ordering.',
      inputSchema: wheelSpecMetadataInput,
      annotations: { title: 'Wheel Spec Metadata', readOnlyHint: true, openWorldHint: true },
    },
    wrap(wheelSpecMetadata),
  );

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export function isCliEntry(
  moduleUrl: string = import.meta.url,
  argv1: string | undefined = process.argv[1],
): boolean {
  if (!argv1) return false;
  try {
    return realpathSync(fileURLToPath(moduleUrl)) === realpathSync(argv1);
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  main().catch((err) => {
    console.error('[mcp-server-wheel-size] fatal:', err);
    process.exit(1);
  });
}
