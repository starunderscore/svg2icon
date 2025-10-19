# Testing Guide (1.0.0)

Pragmatic checks to validate Linux x64 and Windows x64 builds.

## Test matrix
- Linux x64: one Debian/Ubuntu distro (DEB) and AppImage on a second distro (for portability)
- Windows x64: Windows 10 or 11

## Setup
- Sample assets: pick a few SVGs (simple logo, complex paths, large 4096px)
- Install builds from `release/` outputs

## Core flows
- Launch: app opens without errors; app icon shows correctly
- Import: drag-and-drop SVG and via file picker
- Presets: Desktop App, Website, Favicon-only selectable
- Generate: choose output folder, click Generate, operation completes without error

## Outputs
- PNG set: sizes include 16, 32, 64, 128, 256, 512, 1024
- Windows `.ico`: multi-resolution bundle present
- macOS `.icns`: bundle present
- Web: `favicon.ico`, `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`
- File names: no spaces/encoding errors; handles non-ASCII SVG filenames

## Quality
- Visual check: edges are crisp (no blur/aliasing); scale small sizes (16/32) and large (512/1024)
- Large SVG: 4k dimension SVG converts within reasonable time and memory

## App behavior
- No network access during normal use
- Update check only when explicitly triggered (if implemented)
- Error path: invalid/empty SVG → user-friendly error message

## Platform specifics
- Linux AppImage: `chmod +x`, run, no missing lib errors
- Linux DEB: installs, appears in desktop menu, launches; uninstall cleanly removes app
- Windows NSIS: installs with shortcuts; uninstall removes app, leaves user files intact

## Smoke pass criteria
- All core flows succeed
- All expected outputs present and open in native viewers
- No crashes, no blocking errors

Tips: If a failure occurs, capture the SVG, logs, and platform details to file an issue.
