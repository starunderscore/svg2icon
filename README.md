# SVG2Icon — Icon Generator (v1.1.0)

[![Maverick Spirit Product](https://img.shields.io/badge/Maverick%20Spirit-Product-ff69b4.svg)](#)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](#)
[![Electron](https://img.shields.io/badge/electron-28%2B-9cf.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](#)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux-informational.svg)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docs: User Manual](https://img.shields.io/badge/docs-User%20Manual-8A2BE2.svg)](https://example.com/docs/svg2icon/user-manual/v1.1.0)
[![Docs: Tech Guide](https://img.shields.io/badge/docs-Tech%20Guide-8A2BE2.svg)](https://example.com/docs/tech-guide/v1.1.0)

Convert a single SVG into complete, production‑ready icon sets for Web, Mobile, and Desktop. SVG2Icon is a desktop app built with Electron + TypeScript.

## Install & Run

Prebuilt releases: GitHub Releases (TBA). On Linux, install `.deb` or `.rpm`. On Windows, install the NSIS `.exe`.

Dev (contributors):
```bash
git clone https://github.com/starunderscore/svg2icon
cd svg2icon
npm install
npm run dev
```

Build artifacts:
```bash
npm run dist
```
Artifacts are written under `release/` (platform‑specific subfolders).

## Documentation (placeholders)
Replace these with your published docs URLs when ready.

| Manual | Version | Link |
| --- | --- | --- |
| User Manual | v1.1.0 | https://example.com/docs/svg2icon/user-manual/v1.1.0 |
| Tech Guide | v1.1.0 | https://example.com/docs/tech-guide/v1.1.0 |

## Quick usage
1) Click “New SVG”, drop your SVG, confirm the name
2) Pick a Download option (Web / Mobile / Desktop / All / SVG)
3) Save the ZIP (named as shown above)
4) Extract and use platform folders

## Highlights
- Single‑source: drop in one SVG; get platform folders out
- Targets: Web, Mobile (iOS + Android), Desktop, All‑In‑One, and Original SVG
- Correct sizes and filenames for each platform
- Clean ZIP naming: `<project name> - <Selection> - svg2icon.zip`
 
## Output overview

Web
```tree
<project> - Web - svg2icon.zip/
└─ web/
   ├─ apple-touch-icon-57.png
   ├─ apple-touch-icon-60.png
   ├─ apple-touch-icon-72.png
   ├─ apple-touch-icon-76.png
   ├─ apple-touch-icon-114.png
   ├─ apple-touch-icon-120.png
   ├─ apple-touch-icon-144.png
   ├─ apple-touch-icon-152.png
   ├─ apple-touch-icon-180.png
   ├─ favicon-16.png
   ├─ favicon-32.png
   ├─ favicon.ico
   ├─ manifest-192.png
   ├─ manifest-512.png
   ├─ manifest.json
   └─ icons-head.html
```

Mobile
```tree
<project> - Mobile - svg2icon.zip/
└─ mobile/
   ├─ ios-icons/
   │  ├─ icon-20@1x.png
   │  ├─ icon-20@2x.png
   │  ├─ icon-20@3x.png
   │  ├─ icon-29@1x.png
   │  ├─ icon-29@2x.png
   │  ├─ icon-29@3x.png
   │  ├─ icon-40@1x.png
   │  ├─ icon-40@2x.png
   │  ├─ icon-40@3x.png
   │  ├─ icon-60@2x.png
   │  ├─ icon-60@3x.png
   │  ├─ icon-76@1x.png
   │  ├─ icon-76@2x.png
   │  ├─ icon-83.5@2x.png
   │  └─ icon-1024@1x.png
   └─ android-icons/
      ├─ mipmap-ldpi/
      │  └─ ic_launcher.png
      ├─ mipmap-mdpi/
      │  └─ ic_launcher.png
      ├─ mipmap-hdpi/
      │  └─ ic_launcher.png
      ├─ mipmap-xhdpi/
      │  └─ ic_launcher.png
      ├─ mipmap-xxhdpi/
      │  └─ ic_launcher.png
      ├─ mipmap-xxxhdpi/
      │  └─ ic_launcher.png
      └─ playstore-icon.png
```

Desktop
```tree
<project> - Desktop - svg2icon.zip/
└─ desktop/
   ├─ icon-16.png
   ├─ icon-24.png
   ├─ icon-32.png
   ├─ icon-48.png
   ├─ icon-64.png
   ├─ icon-96.png
   ├─ icon-128.png
   ├─ icon-256.png
   ├─ icon-512.png
   ├─ icon-1024.png
   ├─ icon.ico
   └─ icon.icns
```

All‑In‑One
```tree
<project> - All - svg2icon.zip/
├─ web/
│  └─ (same as Web above)
├─ mobile/
│  └─ (same as Mobile above)
├─ desktop/
│  └─ (same as Desktop above)
└─ svg/
   └─ <project>_original.svg
```

## Notes
- favicon.ico is created when possible; if tools are unavailable, a 32px fallback is provided.
- The Original SVG is not included in Web/Mobile/Desktop packages; use the “SVG” download or the All‑In‑One bundle.
- Themes: Light / System / Dark, configurable in Settings.

## License

MIT — see `LICENSE`.
