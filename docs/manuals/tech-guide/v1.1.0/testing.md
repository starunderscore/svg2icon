# Pre‑Release Manual Smoke Tests — Electron Area (v1.1.0)

This pre‑release manual smoke test focuses on the Electron area for v1.1.0. The goal is to verify user data handling, IPC, and packaging without blocking the broader app.

## Scope
- Main process and storage under `src/electron/*` and `src/main.ts`
- User data separation (prod vs. dev)
- IPC endpoints used by the renderer
- Download/packaging flows (web / mobile / desktop / all / original)

## User data (dev vs. prod)
- Behavior: running with `--dev` uses a separate user data folder.
  - Dev: `<default-userData>-dev`
  - Prod: `<default-userData>`
- Verify:
  1. Run dev: `npm run dev`
  2. Create a project; quit app
  3. Locate the dev userData path and confirm `svg2icon.json` exists
  4. Run a production build (or run without `--dev` if you have a packaged build) and confirm a different userData folder is used

> Remember: Dev user data file location examples
> - Windows: %APPDATA%\SVG2Icon-dev\svg2icon.json
> - Linux: ~/.config/SVG2Icon-dev/svg2icon.json

## Storage and projects
- Create → Edit → Delete
  - Create a project (drop SVG, name auto‑filled)
  - Edit: Replace SVG and rename; confirm changes persist
  - Delete: Type exact name to enable Delete; confirm it’s removed
- Confirm `svg2icon.json` reflects the created/updated/deleted record

## IPC sanity
- Verify main IPC endpoints respond without errors (minimal smoke):
  - Projects: `getAll`, `create`, `update`, `delete`, `generateIcons`
  - Files: `selectSvg`, `selectOutputFolder`, `downloadProject`
  - Settings: `get`, `set`, `setTheme`
  - App: `getVersion`, `checkForUpdates`
- Method: exercise these via the UI and watch the devtools console for errors; no crash, no unhandled promise rejections

## Packaging flow (downloads)
- Web
  - Contains: favicons + apple‑touch icons + manifest PNGs + `manifest.json` + `icons-head.html`
  - `favicon.ico` present; if tooling unavailable, a 32px fallback is used
  - Does NOT include `original.svg`
- Mobile
  - iOS sizes in `ios-icons/`
  - Android densities under `android-icons/mipmap-*/`
- Desktop
  - PNG sizes plus `icon.ico` (Windows) and `icon.icns` (macOS, when available)
- All‑In‑One
  - Includes `web/`, `mobile/`, `desktop/`, and `svg/` (with `<project>_original.svg`)

## Release naming
- Confirm ZIP names: `<project name> - <Selection> - svg2icon.zip`
- If a file with the same name exists, a ` (n)` suffix is added automatically

> Technical Stuff: For manual smoke checks, enabling devtools (npm run dev) and watching the console is sufficient for v1.1.0.
