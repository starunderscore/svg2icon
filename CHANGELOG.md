# Changelog

All notable changes to this project are documented here.

Format: Based on Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased]

Planned for 1.1.0 (post 1.0.0 release):
- Content: New website/catalog vibe integrated across product pages
- Storefront: Catalog → detail flow with clearer CTAs
- Copy polish: Friendlier tone, short value props, consistent terminology
- Packaging: Continue focusing on Linux x64 and Windows x64
- UX: Small fit-and-finish improvements in the app UI
 - Privacy: clarify telemetry is opt-out and can be defaulted off via env vars

## [1.0.0] - 2025-10-19

Initial public release — a stable, production‑ready baseline; substantial groundwork under the hood with an intentionally minimal, cohesive surface.

### Added
- App: Convert a single SVG into complete icon sets
- Presets: Desktop App, Website, Favicon-only
- Formats: PNG bundles, `.ico` (Windows), `.icns` (macOS), favicons
- Quality: resvg rendering + sharp processing for crisp results
- Platform builds: Linux (x64) AppImage + DEB, Windows (x64) NSIS installer
- Release hygiene: checksums file for artifacts

### Changed
- Release targets finalized: Linux x64 (AppImage, DEB) and Windows x64 (NSIS)

### Security/Privacy
- Telemetry is opt-out (enabled by default); optional anonymous analytics via PostHog
