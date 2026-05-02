#!/usr/bin/env node
// Wheel-Size.com API MCP server — 8 read-only tools for vehicle wheel and tyre fitment data.

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
        : ` — body: ${JSON.stringify(error.body)}`;
    message = `Wheel-Size API error ${error.status} ${error.statusText}${body}`;
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

  // ---- Enumeration ----

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
        'Make availability is region-dependent — the same brand may have different slugs across markets.',
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
        'Returns generation slugs (e.g., "b9" for Audi A4 2020) used as the "generation" input for list-modifications.',
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

  // ---- Search ----

  server.registerTool(
    'search-by-model',
    {
      description:
        'Look up OEM and aftermarket wheel/tyre fitment specs for a specific vehicle by make, model, year, and region. ' +
        'Returns per-trim fitment data including: tyre size (e.g., "245/45R18"), rim spec (e.g., "8Jx18 ET39"), ' +
        'bolt pattern / PCD (e.g., "5x112"), centre bore (CB in mm), and whether the fitment is OEM or aftermarket. ' +
        'This is the primary tool for fitment lookups. ' +
        'An empty data array means no fitment data exists for this make+region combination — not an API error.',
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
