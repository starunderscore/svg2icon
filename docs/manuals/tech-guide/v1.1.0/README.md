# Tech Overview

Manual: svg2icon-tech-1.1.0

This overview reflects the completed v1.1.0 app and the current directory layout. It covers the process model, IPC, storage, icon generation, packaging, theming, and build/distribution.

## IPC Surface (via preload)
- Projects: `getAll`, `create`, `update`, `delete`, `generateIcons`
- Files: `selectSvg`, `selectOutputFolder`, `downloadProject`
- Settings: `get`, `set`, `setTheme`
- Window: `minimize`, `maximize`, `close`
- App: `getVersion`, `checkForUpdates`, `openExternal`
- Menu events: new project, settings, updates, manuals, about

## Storage
- JSON at `userData/svg2icon.json` with `{ projects: [], settings: {} }`
- Dev vs Prod userData
  - Dev adds `-dev` suffix when launching with `--dev`
  - Examples
    - Windows: %APPDATA%\SVG2Icon-dev\svg2icon.json
    - Linux: ~/.config/SVG2Icon-dev/svg2icon.json

## Icon Generation
- `IconGenerationService` renders platform sets from `svgData`
- Output under `userData/svg2icon/projects/<id>/`
  - `web-icons/`, `desktop-icons/`, `ios-icons/`, `android-icons/`
- Web excludes any `original.svg`; All‑in‑One adds `svg/<project>_original.svg`

## Packaging (Downloads)
- Build staging per selection (web/mobile/desktop/all/original), then zip
- ZIP name: `<project name> - <Selection> - svg2icon.zip` with automatic ` (n)` suffix on collisions

## Theming & UX
- Window background set before show based on stored theme to avoid flash
- Renderer applies initial theme via `?theme=` query param
- Native app menu wires common actions (New Project, Settings, Updates, Manuals, About)

## Source Layout
```tree
src
├─ assets/        # app assets (icons, manifests)
├─ components/    # UI building blocks (layout, modals, tables)
├─ constants/     # shared constants (labels, sizes, keys)
├─ electron/      # main process, IPC handlers, preload bridge
├─ renderer/      # HTML shell and boot code
├─ services/      # domain logic (IconGenerationService, etc.)
├─ styles/        # global + theme styles (dark default)
├─ types/         # TypeScript types/interfaces
├─ utils/         # helpers (formatters, events, file utils)
└─ main.ts        # app entry (creates BrowserWindow, mounts IPC)
```

## Build & Distribution
- TypeScript compiles to `dist/`
- electron-builder targets: Linux (DEB/RPM), Windows (NSIS), macOS (when applicable)
- Host-aware dist script selects viable targets based on host tools

## Development Workflow
- Install dependencies: `npm install`
- Run dev (isolated userData): `npm run dev` (adds `-dev` suffix)
- Package builds: `npm run dist` or platform-specific scripts in `package.json`
