# Tech Overview

Manual: tech-v1.1.*

This page orients you to SVG2Icon’s architecture, layout, and build pipeline. Use the left navigation to jump into setup, running, and packaging.

## Architecture
SVG2Icon is an Electron desktop app written in TypeScript. It has three parts:

- Main — lifecycle, IPC, filesystem, packaging helpers
- Preload — safe, minimal `electronAPI` bridge with `contextIsolation`
- Renderer — small TypeScript components + services (no heavy framework)

## Source Layout
```tree
src/
  electron/        # main process + preload bridge
  components/      # modal/layout/ui building blocks
  renderer/        # HTML shell, boot code, styles
  services/        # app/feature services (settings, projects, telemetry)
  styles/          # global + theme styles (dark is default)
scripts/           # dist helpers (host-aware build/trim/checksums)
docs/              # manuals + static viewer
```

## Build & Packaging
TypeScript compiles to `dist/`. electron-builder produces platform packages (Linux DEB/RPM, Windows NSIS, macOS DMG where applicable). The host-aware `scripts/dist-host.mjs` selects targets based on available tools (e.g., `dpkg-deb`, `rpmbuild`, `wine`).

## Development Workflow
1) Install deps: `npm install`
2) Start dev: `npm run dev`
3) Build distributables: `npm run dist` (or platform-specific scripts in `package.json`)
