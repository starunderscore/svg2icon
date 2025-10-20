# Testing Guide (1.0.0)

Manual testing only for v1.0.0. Builds are produced on Ubuntu; verify installs on Ubuntu (.deb), Fedora/RHEL (.rpm), and Windows (NSIS).

## Test matrix
- Linux x64: Debian/Ubuntu (DEB) and Fedora/RHEL (RPM)
- Windows x64: Windows 10 or 11

## Setup
- Sample assets: pick a few SVGs (simple logo, complex paths, large 4096px)
- Install builds from `release/` outputs on each target OS

## Install commands (cheat sheet)
- Ubuntu/Debian (.deb):
  ```bash
  cd release/linux/x64
  sudo apt install ./SVG2Icon-<version>-linux-amd64.deb   # or: sudo apt install ./*.deb
  ```
  Uninstall:
  ```bash
  sudo apt remove svg2icon   # or: sudo apt purge svg2icon
  ```

- Fedora/RHEL (.rpm):
  ```bash
  cd release/linux/x64
  sudo dnf install ./SVG2Icon-<version>-1.x86_64.rpm   # or: sudo dnf install ./*.rpm
  ```

- Windows (NSIS .exe):
  - Run the installer and accept defaults; verify Start Menu/Desktop shortcuts

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
- Linux DEB (Ubuntu/Debian): installs, appears in desktop menu, launches; uninstall cleanly removes app
- Linux RPM (Fedora/RHEL): installs, appears in desktop menu, launches; uninstall cleanly removes app
- Windows NSIS: installs with shortcuts; uninstall removes app, leaves user files intact

## Smoke pass criteria
- All core flows succeed
- All expected outputs present and open in native viewers
- No crashes, no blocking errors

Tips: If a failure occurs, capture the SVG, logs, and platform details to file an issue.

