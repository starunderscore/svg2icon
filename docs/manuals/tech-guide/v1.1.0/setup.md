# Setup & Prerequisites

## Requirements
- Node.js 18+ and npm
- Git
- OS for your target:
  - Windows 10/11 for Windows installer
  - Ubuntu/Debian/Fedora for Linux packages

## Install dependencies
```bash
npm ci
```

This also runs `electron-builder install-app-deps` to rebuild native modules.

## Optional tools
- ImageMagick (`magick` or `convert`) for ICO fallback
- `png2icons` (installed via npm) for ICO/ICNS generation in app flows
- Wine + Mono (on Linux) to cross-build Windows NSIS (optional)
