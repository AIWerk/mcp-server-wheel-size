# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- v0.2.0: 24 additional read-only tools — full vendor surface (32 tools total)
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
