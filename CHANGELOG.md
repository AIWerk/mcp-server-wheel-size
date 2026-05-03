# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1] - 2026-05-03

### Fixed
- `stud_holes` → `.int().min(3)`; `pcd` → `.positive()` in `by_rim.ts`
- `fd`/`fdOpt` → `.positive()`; `fs_poke`/`bs_push`/`diameter_range` → `.min(0)` in `classified.ts`

## [0.3.0] - 2026-05-03

### Fixed
- Zod boundary validation on all numeric fitment fields: `rim_diameter`/`rim_width`/`section_width`/`overall_diameter`/`cb` → `.positive()`; `rim_offset` (ET) → `.min(-100).max(100)`; `aspect_ratio` → `.min(1).max(100)`; `year` → `.min(1900).max(2100)`; `limit` → `.min(1).max(100)`
- Mutex cross-field validation in handlers: `rim_offset` vs `rim_offset_min`/`rim_offset_max` (XOR); `cb` vs `cb_min`/`cb_max` (XOR); `overall_diameter` vs `section_width`/`aspect_ratio` (XOR)

### Changed
- README tool list expanded to all 32 tools with `<!-- TOOLS:START/END -->` markers; `scripts/gen-tool-list.mjs` generates it from the live server registry

### Internal
- `tsconfig.json` excludes `src/**/*.test.ts` so test files are not compiled into `dist/` and do not appear in the npm tarball

## [0.2.0] — 2026-05-03

### Added
- 24 additional read-only tools — full vendor surface (32 tools total)
  - `/by_rim/*` (7): list-rim-bolt-patterns, list-rim-centre-bores, list-rim-offsets, list-rim-diameters, list-rim-widths, search-by-rim, search-modifications-by-rim
  - `/by_tire/*` (5): list-tire-aspect-ratios, list-tire-rim-diameters, list-tire-section-widths, search-by-tire, search-modifications-by-tire
  - `/by_hf_tire/*` (5): list-hf-tire-overall-diameters, list-hf-tire-rim-diameters, list-hf-tire-section-widths, search-by-hf-tire, search-modifications-by-hf-tire
  - `/classified/*` (6): search-classified-packages, search-modifications-by-classified-package, list-classified-rims, search-classified-rims, search-modifications-by-classified-rim, search-classified-tires
  - `/spec/metadata/` (1): wheel-spec-metadata
- Pagination (limit/offset) exposed on all search endpoints that support it

## [0.1.0] — 2026-05-02

### Added
- Initial v0.1.0: 8 read-only tools (list-regions, list-makes, list-years, list-models, list-generations, list-modifications, search-by-model, wheel-upsteps)
- Auth: BYOK API key via `WHEEL_SIZE_API_KEY` query parameter (`user_key`)
- Tests: 35 unit tests, vitest
