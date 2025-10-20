# Building Installers

This project uses electron-builder to create native installers for Windows and Linux.

Quick build (Ubuntu host builds Linux DEB + RPM, optional Windows NSIS):

```bash
npm run dist
```

Artifacts are written to `release/<platform>/<arch>/` (e.g., `release/linux/x64/`, `release/win/x64/`).

## Prerequisites

- Node.js 18+ and npm
- A supported OS for the target you’re building:
  - Build Windows installers on Windows (recommended)
  - Build Linux packages on Linux

Native modules are rebuilt automatically via `electron-builder install-app-deps` (scripted in `postinstall`).

## Windows 10/11 (NSIS .exe)

Primary workflow builds from Ubuntu via Wine (optional). Native Windows builds remain supported.

1. On Ubuntu, optionally enable Windows cross-build:
   ```bash
   sudo apt update
   sudo apt install -y wine64 mono-complete
   npm ci
   npm run dist
   ```
   Output (v1.0.0): `release/win/x64/SVG2Icon-<version>-win-x64.exe` and `SHA256SUMS.txt`.

2. On native Windows (alternative):
   ```bash
   npm ci
   npm run dist
   ```
   Notes:
   - If native build tools are needed, install Visual Studio Build Tools 2022 (C++ workload).
   - 32-bit Windows (ia32) is not shipped in v1.0.0.

## Ubuntu/Kubuntu 24.04 (.deb + .rpm)

1. Ensure build tools:
  ```bash
  sudo apt update
  sudo apt install -y fakeroot dpkg-dev rpm
  ```
2. Build on Ubuntu (produces .deb and .rpm):
   ```bash
   npm ci
   npm run dist
   ```
3. Output: `.deb` and `.rpm` in `release/linux/x64/` (RPM requires `rpmbuild` from the `rpm` package). If `rpmbuild` is missing, the build script skips RPM and continues. A `SHA256SUMS.txt` file is generated for verification.

### Install the .deb (simple)

Recommended (apt can resolve dependencies for local .deb files):

```bash
cd release/linux/x64
sudo apt install ./SVG2Icon-<version>-linux-amd64.deb   # or: sudo apt install ./*.deb
```

Alternative using dpkg (use apt to fix dependencies if needed):

```bash
cd release/linux/x64
sudo dpkg -i ./SVG2Icon-<version>-linux-amd64.deb || sudo apt -f install
```

### Uninstall (remove)

```bash
sudo apt remove svg2icon           # keep user settings
# or
sudo apt purge svg2icon            # remove package and system config files
```

Optional: cross-build Windows NSIS on Ubuntu is covered above; if Wine isn’t installed, the script skips Windows.
## Fedora/RHEL testing (.rpm)
Build on Ubuntu, then test install on Fedora/RHEL using the generated `.rpm`:

```bash
cd release/linux/x64
sudo dnf install ./SVG2Icon-<version>-1.x86_64.rpm   # or: sudo dnf install ./*.rpm
```


<!-- ARM64 builds are not enabled in v1.0.0. -->

## What we ship (v1.0.0)

- Windows: NSIS installer (`.exe`, x64) with Start Menu and Desktop shortcuts in `release/win/`
- Linux: `.deb` (Debian/Ubuntu/Mint, x64) and `.rpm` (Fedora/RHEL, x64) in `release/linux/`

## Icons and Metadata

Packaged installers use:
- Windows icon: `src/assets/this-app/icon.ico`
- macOS icon: `src/assets/this-app/icon.icns`
- Linux icon: `src/assets/this-app/icon-512.png`

Linux desktop entry uses the `Graphics` category.
