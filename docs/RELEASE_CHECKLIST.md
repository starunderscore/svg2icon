# Release Checklist

Concise steps to ship a version. Tailor as needed.

## 1) Prep
- Update version in `package.json` and `CHANGELOG.md`
- Ensure `CHANGELOG.md` has a dated section for the release
- Commit changes with a clear message

## 2) Build
- Install: `npm ci`
- Compile: `npm run build`
- Package:
  - Host Linux: `npm run dist` (produces Linux x64 DEB + RPM; Windows x64 if wine is available)
  - Or run platform scripts as appropriate

## 3) Artifacts
- Verify outputs exist:
  - `release/linux/x64/*.deb`
  - `release/linux/x64/*.rpm`
  - `release/win/x64/*-win-x64.exe` (if building Windows)
- Checksum file present: `SHA256SUMS.txt` in each folder

## 4) Smoke tests
- Linux (x64):
  - DEB (Debian/Ubuntu): install; launch from menu; generate icons
  - RPM (Fedora/RHEL): install; launch from menu; generate icons
- Windows (x64):
  - Install NSIS; launch from Start; generate icons

## 5) Tag and release
- Tag: `git tag vX.Y.Z && git push --tags`
- Draft GitHub Release:
  - Title: `vX.Y.Z`
  - Notes: paste from `CHANGELOG.md`
  - Upload artifacts + checksums
- Publish

## 6) Website update
- Update catalog card, details pages, and download links to latest build

## 7) Next cycle
- Create/refresh `## [Unreleased]` in `CHANGELOG.md`
- Bump `package.json` to next version (e.g., `1.1.0`) when ready to start work
