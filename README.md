# @aiwerk/mcp-server-wheel-size

Wheel-Size.com API MCP server — vehicle wheel and tyre fitment data for 10,000+ makes, models, and trim levels.

## Install

```bash
npx -y @aiwerk/mcp-server-wheel-size
```

Or add to your MCP client config:

```json
{
  "mcpServers": {
    "wheel-size": {
      "command": "npx",
      "args": ["-y", "@aiwerk/mcp-server-wheel-size"],
      "env": {
        "WHEEL_SIZE_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Configure

| Variable | Required | Description |
|---|---|---|
| `WHEEL_SIZE_API_KEY` | ✅ | API key from [developer.wheel-size.com](https://developer.wheel-size.com/) |
| `WHEEL_SIZE_API_TIMEOUT_MS` | ❌ | Request timeout in ms (default: 30000) |

## Tools

32 read-only tools across 7 categories. Run `node scripts/gen-tool-list.mjs` after build to refresh this list.

<!-- TOOLS:START -->
| Name | Description |
|---|---|
| `list-classified-rims` | List aftermarket rim products compatible with a given rim fitment spec. Required: bolt_pattern, rim_diameter (inches), rim_width (inches), rim_offset (ET mm). Optional: cb, fd, fitment tolerances (fs_poke, bs_push, od_tolerance, ow_tolerance), diameter_range, sort, limit, offset. Returns rim product listings with SKU data. |
| `list-generations` | List all body generations for a given make/model/year combination. Returns generation slugs (e.g., "b9" for Audi A4 2020) used as the "generation" input for list-modifications and classified tools. |
| `list-hf-tire-overall-diameters` | List all overall diameter values (inches) for high-flotation (HF) tyres, optionally filtered by region. HF tyres use the imperial size format: OD x SW R RD (e.g. 33x12.5R15). Common on pickup trucks and off-road vehicles. Use this to discover valid overall_diameter values for search-by-hf-tire. |
| `list-hf-tire-rim-diameters` | List all rim diameters (inches) available for HF tyres, optionally filtered by overall diameter and section width. Use this to discover valid rim_diameter values for search-by-hf-tire. |
| `list-hf-tire-section-widths` | List all section widths (in inches) for HF tyres, optionally filtered by overall diameter and region. Note: section_width is in INCHES for HF tyres (e.g. 12.5), unlike standard tyre tools where it is in mm. |
| `list-makes` | List all vehicle manufacturers (makes) available in a given market region. Returns slugs used as the "make" input for subsequent tools. Make availability is region-dependent, the same brand may have different slugs across markets. |
| `list-models` | List all vehicle models for a given make and year. Returns slugs used as the "model" input for list-generations, list-modifications, and search-by-model. |
| `list-modifications` | List all trim/engine modifications for a given make/model/year/generation. Useful for drilling into specific engine variants before querying fitment data. |
| `list-regions` | List all available market region codes (e.g., "eudm" for Europe, "usdm" for North America, "jdm" for Japan). Region codes are required inputs for list-makes, search-by-model, and wheel-upsteps. Start here when region is unknown. |
| `list-rim-bolt-patterns` | List all bolt patterns (PCD) available in the database, optionally filtered by rim dimensions and centre bore range. Bolt pattern format: stud-count × circle-diameter in mm (e.g. "5x112"). Use this to discover valid bolt_pattern values before calling search-by-rim. |
| `list-rim-centre-bores` | List all centre bore (CB) values available, optionally filtered by rim dimensions, offset range, and bolt pattern. Centre bore is the diameter of the hole in the wheel centre in mm (e.g. 66.5). Use this to discover valid cb values for search-by-rim. |
| `list-rim-diameters` | List all rim diameters (in inches) available in the database, optionally filtered by bolt pattern and region. Use this to discover valid rim_diameter values before calling search-by-rim. |
| `list-rim-offsets` | List all rim offset (ET) values available, optionally filtered by rim diameter, width, and bolt pattern. Offset is the distance from the wheel mounting surface to the rim centre-line in mm (positive = hub-centric, negative = deep dish). Use this to discover valid rim_offset values. |
| `list-rim-widths` | List all rim widths (in inches) available, optionally filtered by diameter and bolt pattern. Use this to discover valid rim_width values for search-by-rim. |
| `list-tire-aspect-ratios` | List all tyre aspect ratios available, optionally filtered by section width and region. Aspect ratio is the sidewall height as a percentage of section width (e.g. 45 in a 245/45R18). Use this to discover valid aspect_ratio values for search-by-tire. |
| `list-tire-rim-diameters` | List all rim diameters (in inches) compatible with a given tyre section width and aspect ratio. Use this to discover valid rim_diameter values for search-by-tire. |
| `list-tire-section-widths` | List all tyre section widths (in mm) available in the database, optionally filtered by region. Use this to discover valid section_width values for search-by-tire. |
| `list-years` | List all model years available for a given manufacturer. Use the year values returned here as the "year" input for list-models, list-generations, and search-by-model. |
| `search-by-hf-tire` | Find all vehicles compatible with a given high-flotation (HF) tyre size. For pickup trucks and off-road vehicles. HF size format: OD x SW R RD (e.g. 33x12.5R15). Required: overall_diameter (inches), section_width (INCHES, not mm!), rim_diameter (inches). Optional: region, limit, offset. |
| `search-by-model` | Look up OEM and aftermarket wheel/tyre fitment specs for a specific vehicle by make, model, year, and region. Returns per-trim fitment data including: tyre size (e.g., "245/45R18"), rim spec (e.g., "8Jx18 ET39"), bolt pattern / PCD (e.g., "5x112"), centre bore (CB in mm), and whether the fitment is OEM or aftermarket. This is the primary tool for fitment lookups. An empty data array means no fitment data exists for this make+region combination. Not an API error. |
| `search-by-rim` | Find all vehicles compatible with a given rim specification. Reverse lookup: "which cars fit these rims?" Required: bolt_pattern (e.g. "5x112"). Optional: rim_diameter, rim_width, rim_offset (or range), centre bore (cb), fastener diameter (fd), region. Supports pagination with limit and offset. Returns vehicle make/model/year/trim combinations that accept this rim fitment. |
| `search-by-tire` | Find all vehicles compatible with a given standard tyre size. Reverse lookup: "which cars fit 245/45R18?" Required: section_width (mm, e.g. 245), aspect_ratio (%, e.g. 45), rim_diameter (inches, e.g. 18). Optional: region, limit, offset. Returns vehicle make/model/year/trim combinations that accept this tyre fitment. |
| `search-classified-packages` | Find aftermarket wheel+tyre package products (rim+tyre combos sold together) compatible with a given fitment spec. Required: bolt_pattern, rim_diameter (inches), rim_width (inches), rim_offset (ET mm), section_width (mm), aspect_ratio (%). Optional: cb (centre bore mm), fd (fastener diameter mm), fs_poke/bs_push (fitment tolerances mm), od_tolerance (decimal 0-0.05), ow_tolerance (decimal 0-0.03), diameter_range (+-inches), sort, limit, offset. Returns product listings with SKU and compatibility data. |
| `search-classified-rims` | Search aftermarket rim products by fitment spec, returning vehicle compatibility info alongside the rim listings. Required: bolt_pattern, rim_diameter (inches), rim_width (inches), rim_offset (ET mm). Optional: cb, fd, fitment tolerances, diameter_range, sort, limit, offset. Similar to list-classified-rims but includes vehicle-fitment matching. |
| `search-classified-tires` | Search aftermarket tyre products by tyre size specification. Required: section_width (mm), aspect_ratio (%), rim_diameter (inches). Optional: limit, offset. Returns tyre product listings matching the given size. |
| `search-modifications-by-classified-package` | Find wheel+tyre package products compatible with a specific vehicle make/model/generation. Required: bolt_pattern, rim_diameter, rim_width, rim_offset, section_width, aspect_ratio, make, model, generation. Optional: tolerance and fitment parameters (same as search-classified-packages). Use when you need to verify package compatibility for a particular trim level. |
| `search-modifications-by-classified-rim` | Find aftermarket rim products compatible with a specific vehicle make/model/generation. Required: bolt_pattern, rim_diameter, rim_width, rim_offset, make, model, generation. Optional: cb, fd, fitment tolerances, diameter_range, sort, limit, offset. |
| `search-modifications-by-hf-tire` | Find specific trim variants of a known make+model compatible with a given HF tyre size. Required: overall_diameter (inches), section_width (INCHES), rim_diameter (inches), make, model. Optional: region, limit, offset. |
| `search-modifications-by-rim` | Find specific trim/modification variants of a known make+model that are compatible with a given rim spec. Required: make, model, bolt_pattern. Optional: rim dimensions, offset, centre bore, region. More granular than search-by-rim. Use when you already know the vehicle and want to check trim-level fitment. |
| `search-modifications-by-tire` | Find specific trim/modification variants of a known make+model compatible with a given tyre size. Required: make, model, section_width (mm), aspect_ratio (%), rim_diameter (inches). Optional: region, limit, offset. More granular than search-by-tire. Use when you already know the vehicle. |
| `wheel-spec-metadata` | Get computed geometry and population statistics for a given wheel/tyre specification. All fields optional. Provide as many as known for precise results. Returns geometry hints (backspace, frontspace, clearance estimates), population stats (how many vehicles use this spec), and optional human-readable fitment hints when hints=true. Useful for explaining fitment math to users or validating a spec before ordering. |
| `wheel-upsteps` | Get aftermarket wheel upsize (plus-sizing) suggestions for a vehicle. Returns larger rim diameter options that maintain overall tyre diameter within acceptable tolerance. Key fitment terms returned: PCD (bolt pattern), offset (ET in mm), centre bore (CB in mm), section width, aspect ratio. Use this to recommend wheel upgrades while preserving speedometer accuracy. |
<!-- TOOLS:END -->

## Auth

Register for a free sandbox account at [developer.wheel-size.com](https://developer.wheel-size.com/). The sandbox tier allows 300 API calls per day.

> **Note:** The API key is sent as a `user_key` query parameter, not as an HTTP header.

## License

MIT — [AIWerk](https://aiwerkmcp.com)
