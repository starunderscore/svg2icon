# Building Installers

This project uses electron-builder to create native installers for Windows and Linux.

Quick build (auto-selects targets by host):

```bash
npm run dist
```

Artifacts are written to `release/<platform>/<arch>/` (e.g., `release/linux/x64/`, `release/win/ia32/`).

## Prerequisites

- Node.js 18+ and npm
- A supported OS for the target you’re building:
  - Build Windows installers on Windows (recommended)
  - Build Linux packages on Linux

Native modules are rebuilt automatically via `electron-builder install-app-deps` (scripted in `postinstall`).

## Windows 10/11 (NSIS .exe)

1. Install Node.js 18+ from nodejs.org
2. From project root:
   ```bash
   npm ci
   npm run dist
   ```
3. Output (v1.0.0): `release/win/x64/SVG2Icon-<version>-win-x64.exe` and `SHA256SUMS.txt`

Notes:
- If native build tools are needed, install Visual Studio Build Tools 2022 (C++ workload).
- 32-bit Windows (ia32) is not shipped in v1.0.0 due to native dependency constraints; we can revisit if needed.

## Ubuntu/Kubuntu 24.04 (AppImage + .deb)

1. Ensure build tools:
   ```bash
   sudo apt update
   sudo apt install -y libfuse2 fakeroot dpkg-dev
   ```
2. Build:
   ```bash
   npm ci
   npm run dist:linux
   ```
3. Output: `.AppImage` and `.deb` in `release/linux/x64/` (RPM is auto-included if `rpmbuild` is available). A `SHA256SUMS.txt` file is generated for verification.

## Fedora Workstation 42 (AppImage)

1. Ensure build tools:
   ```bash
   sudo dnf install -y rpm-build fuse
   ```
2. Build:
   ```bash
   npm ci
   npm run dist:linux
   ```
3. Output: `.AppImage` in `release/linux/x64/`. A `SHA256SUMS.txt` file is generated for verification.
   - Note: RPM is intentionally omitted for v1.0.0. We can enable it later.

## Manjaro KDE (AppImage)

1. Ensure AppImage runtime:
   ```bash
   sudo pacman -S --needed libfuse2
   ```
2. Build:
   ```bash
   npm ci
   npm run dist:linux
   ```
3. Output: `.AppImage` (plus `.deb`/`.rpm` if tools available) in `release/linux/x64/`. A `SHA256SUMS.txt` file is generated for verification.

## ARM64 (aarch64) builds

If you also want ARM64 artifacts (for Raspberry Pi 5/ARM desktops):

```bash
npm run dist   # on a Linux host; the script builds x64 and arm64
```

Outputs will be written to `release/linux/arm64/`. Note: Running ARM64 artifacts requires an ARM64 system; they won’t run on x64 machines.

## Running the AppImage

```bash
chmod +x release/linux/"SVG2Icon-<version>-linux-x86_64.AppImage"
release/linux/"SVG2Icon-<version>-linux-x86_64.AppImage"
```

## What we ship

- Windows: NSIS installer (`.exe`) with Start Menu and Desktop shortcuts in `release/win/`
- Linux: AppImage (universal) and `.deb` (Debian/Ubuntu/Mint) in `release/linux/`

## Icons and Metadata

Packaged installers use:
- Windows icon: `src/assets/this-app/icon.ico`
- macOS icon: `src/assets/this-app/icon.icns`
- Linux icon: `src/assets/this-app/icon-512.png`

Linux desktop entry uses the `Graphics` category.
