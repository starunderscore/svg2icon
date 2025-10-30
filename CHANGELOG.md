# Changelog

All notable changes to this project are documented here.

## [1.1.0] - 2025-10-23

A complete UX pass with projects, settings, manuals, and support tools — ready for testing.

### Highlights
- Projects UX
  - SVG is stored with each project; rows show preview, name, date, and download buttons
  - Full CRUD: create, edit (replace SVG/rename), delete (exact‑name confirmation)
  - Per‑selection downloads generate ZIPs with platform folders: Web, Mobile (iOS/Android), Desktop, All, and Original (SVG)
- Updates & About
  - “Check for Updates” (Tools menu) shows available version or current version
  - “About” (Help menu) displays app name/version and quick links (website, changelog, licenses)
- Settings
  - Themes: Light / System / Dark (applied early, with system follow)
  - Privacy & Analytics: opt‑out anonymous telemetry (PostHog)
- Documentation
  - User Manual v1.1.0
  - Tech Guide v1.1.0

### Notable improvements
- Consistent ZIP naming: `<project name> - <Selection> - svg2icon.zip`
- Web: always provide `favicon.ico` (with a 32px fallback if tooling is unavailable)
- Web/Mobile/Desktop packages do not include the original SVG (use the dedicated “SVG” or the All‑In‑One bundle)
- Dev runs use a separate userData folder (`-dev` suffix) to keep test data isolated

### UI polish
- Toasts (notifications) appear bottom‑right for success/error
- Stable sidebar/docs viewer with improved code/tree rendering

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
