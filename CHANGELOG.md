# Changelog

All notable changes to this project are documented here.

Format: Based on Keep a Changelog. Versions follow Semantic Versioning.

## [Unreleased]

Nothing yet — tracking begins after 1.2.0.

## [1.2.0] - 2025-10-23

UI overhaul and workflow refinements. This release focuses on a coherent end‑to‑end experience in the app; documentation updates are tracked separately.

### Added
- Unified SVG form modal (Create + Edit) with a fixed‑height SVG area (dropzone ↔ preview) and Replace/Cancel flow
- Download flow prompts for a destination and generates on demand per selection:
  - Web → `web/`
  - Mobile → `mobile/ios-icons/`, `mobile/android-icons/`
  - Desktop → `desktop/`
  - SVG (original) → `svg/`
  - All → `web/`, `mobile/`, `desktop/`, `svg/`
- Bottom‑right toast notifications for success/failure of downloads and key actions

### Changed
- Rebuilt project list and forms for steady visuals:
  - Single table with static header; body‑only scroll
  - SVG area is fixed‑height to prevent layout shifts
- Right‑aligned theme selector pills (Light / System / Dark) with responsive wrap on small screens
- Privacy & Analytics content consolidated into a single card with the toggle on the right
- Folder naming on download: `{project}_{selection}` with automatic uniqueness suffix ` (n)`
- Help button removed from the visible UI (kept in code for a future release); Settings remains a separate, clear action

### Fixed
- Modal header close “line” now closes consistently across modals (no double‑outline/ghost behavior)
- Download actions report clear success/failure; notifications moved to bottom‑right to avoid covering controls

### Performance / Build
- ESM‑safe imports throughout Electron main and services (removed remaining `require` usages in these paths)
- Desktop icon generation:
  - Uses `png2icons` when available for `.ico` / `.icns`
  - Falls back to CLI tools when present (ImageMagick `magick`/`convert` for `.ico`, `png2icns` for `.icns`)
  - Skips quietly if prerequisites are missing, while PNG sets always generate

### Removed
- “Icon Types” UI and default icon type setting
- Download subsection from the row actions menu (download buttons remain in the row)

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
