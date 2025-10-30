# Installation

Links
- Releases (installers): https://github.com/starunderscore/svg2icon/releases
- Source code: https://github.com/starunderscore/svg2icon/tree/main

## Requirements
- Windows or Linux
- Packaged app: nothing extra required
- Developer build (optional): Node.js and npm

## Packaged app (recommended)
1. Download from Releases: https://github.com/starunderscore/svg2icon/releases
   - Windows: NSIS installer (`.exe`)
   - Linux: Debian (`.deb`) or RPM (`.rpm`)
2. Install, then open SVG2Icon from your applications menu.

You’re ready to create your first project.

## Developer build (optional)
 Run from source if you prefer:
 1. Clone the repository
    ```bash
    git clone https://github.com/starunderscore/svg2icon.git
    cd svg2icon
    ```
 2. Install dependencies
    ```bash
    npm install
    ```
 3. Start the app in dev mode
    ```bash
    npm run dev
    ```

## Build your own release (optional)
You can create installers locally if you prefer to package the app yourself:

```bash
npm run dist
```

Artifacts are written to the `release/` folder (with platform‑specific subfolders). For detailed packaging steps and prerequisites, open Help → Tech Guide in the app.
