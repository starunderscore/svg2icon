# SVG2Icon User Manual

Welcome! SVG2Icon turns a single SVG into production‑ready icon sets for web, mobile, and desktop — fast, predictable, and with a clean workflow.

Use the sidebar to explore topics. This page gives you a friendly high‑level tour so you know what to expect.

## What you can do
- Create or edit a project by adding your SVG and a clear name
- Generate icon sets for Web, Mobile (iOS + Android), Desktop — or pick “All” to bundle everything
- Choose where to save; bundles are named `{project}_{selection}` and get a ` (n)` suffix if a folder already exists
- See friendly notifications after actions

## Platforms & install
- Windows and Linux (.deb / .rpm)
- Packaged builds: install and run — no tooling required
- Dev builds: `npm install` then `npm run dev`

## A 60‑second first run
1. Click “New SVG”, drop your SVG, and confirm the name (auto‑filled from filename)
2. Save — your project appears in the table
3. Click a Download option (Web / Mobile / Desktop / All)
4. Save the ZIP; a notification appears in the bottom‑right
5. Need the original again? Download the SVG from the row’s “SVG” button anytime

## Output at a glance

```tree
<project name> - <download selection> - svg2icon.zip/
├─ web/
│  ├─ favicon-16.png
│  ├─ favicon-32.png
│  ├─ favicon.ico
│  ├─ apple-touch-icon-57.png
│  ├─ apple-touch-icon-60.png
│  ├─ apple-touch-icon-72.png
│  ├─ apple-touch-icon-76.png
│  ├─ apple-touch-icon-114.png
│  ├─ apple-touch-icon-120.png
│  ├─ apple-touch-icon-144.png
│  ├─ apple-touch-icon-152.png
│  ├─ apple-touch-icon-180.png
│  ├─ manifest-192.png
│  ├─ manifest-512.png
│  ├─ manifest.json
│  └─ icons-head.html
├─ mobile/
│  ├─ ios-icons/
│  │  ├─ icon-20@1x.png
│  │  ├─ icon-20@2x.png
│  │  ├─ icon-20@3x.png
│  │  ├─ icon-29@1x.png
│  │  ├─ icon-29@2x.png
│  │  ├─ icon-29@3x.png
│  │  ├─ icon-40@1x.png
│  │  ├─ icon-40@2x.png
│  │  ├─ icon-40@3x.png
│  │  ├─ icon-60@2x.png
│  │  ├─ icon-60@3x.png
│  │  ├─ icon-76@1x.png
│  │  ├─ icon-76@2x.png
│  │  ├─ icon-83.5@2x.png
│  │  └─ icon-1024@1x.png
│  └─ android-icons/
│     ├─ mipmap-ldpi/
│     │  └─ ic_launcher.png
│     ├─ mipmap-mdpi/
│     │  └─ ic_launcher.png
│     ├─ mipmap-hdpi/
│     │  └─ ic_launcher.png
│     ├─ mipmap-xhdpi/
│     │  └─ ic_launcher.png
│     ├─ mipmap-xxhdpi/
│     │  └─ ic_launcher.png
│     ├─ mipmap-xxxhdpi/
│     │  └─ ic_launcher.png
│     └─ playstore-icon.png
├─ desktop/
│  ├─ icon-16.png
│  ├─ icon-24.png
│  ├─ icon-32.png
│  ├─ icon-48.png
│  ├─ icon-64.png
│  ├─ icon-96.png
│  ├─ icon-128.png
│  ├─ icon-256.png
│  ├─ icon-512.png
│  ├─ icon-1024.png
│  ├─ icon.ico
│  └─ icon.icns
└─ svg/
   └─ <project name>_original.svg
```

### Web
| Filename | Purpose |
| --- | --- |
| favicon-16.png | Browser tab/bookmark icon (16×16) |
| favicon-32.png | Browser tab/bookmark icon (32×32) |
| favicon.ico | Legacy multi-size icon |
| apple-touch-icon-57.png | iOS touch icon (57×57) |
| apple-touch-icon-60.png | iOS touch icon (60×60) |
| apple-touch-icon-72.png | iOS touch icon (72×72) |
| apple-touch-icon-76.png | iOS touch icon (76×76) |
| apple-touch-icon-114.png | iOS touch icon (114×114) |
| apple-touch-icon-120.png | iOS touch icon (120×120) |
| apple-touch-icon-144.png | iOS touch icon (144×144) |
| apple-touch-icon-152.png | iOS touch icon (152×152) |
| apple-touch-icon-180.png | iOS touch icon (180×180, common) |
| manifest-192.png | Android/Chrome icon (192×192) |
| manifest-512.png | Android/Chrome icon (512×512) |
| manifest.json | Generated metadata for the set |
| icons-head.html | HTML reference tags you can copy into your app |

Reference in HTML:

```html
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/web/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/web/favicon-32.png">
<link rel="icon" href="/web/favicon.ico">

<!-- Apple touch icons (iOS) -->
<link rel="apple-touch-icon" sizes="57x57" href="/web/apple-touch-icon-57.png">
<link rel="apple-touch-icon" sizes="60x60" href="/web/apple-touch-icon-60.png">
<link rel="apple-touch-icon" sizes="72x72" href="/web/apple-touch-icon-72.png">
<link rel="apple-touch-icon" sizes="76x76" href="/web/apple-touch-icon-76.png">
<link rel="apple-touch-icon" sizes="114x114" href="/web/apple-touch-icon-114.png">
<link rel="apple-touch-icon" sizes="120x120" href="/web/apple-touch-icon-120.png">
<link rel="apple-touch-icon" sizes="144x144" href="/web/apple-touch-icon-144.png">
<link rel="apple-touch-icon" sizes="152x152" href="/web/apple-touch-icon-152.png">
<link rel="apple-touch-icon" sizes="180x180" href="/web/apple-touch-icon-180.png">

<!-- Android/Chrome icons -->
<link rel="icon" type="image/png" sizes="192x192" href="/web/manifest-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/web/manifest-512.png">

<!-- Optional mobile meta -->
<meta name="theme-color" content="#000000">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

> Remember: The tags above are the same ones in `web/icons-head.html`. That file is static — only your page header or paths might change.



### iOS
| Filename | Purpose |
| --- | --- |
| icon-20@1x/2x/3x.png | Notification/spot sizes |
| icon-29@1x/2x/3x.png | Settings and Spotlight |
| icon-40@1x/2x/3x.png | Spotlight/App sizes |
| icon-60@2x/3x.png | App icons for iPhone |
| icon-76@1x/2x.png | iPad app icons |
| icon-83.5@2x.png | iPad Pro icon |
| icon-1024@1x.png | App Store asset |
| manifest.json | Generated metadata for the set |

### Android
| Filename | Purpose |
| --- | --- |
| mipmap-ldpi/ic_launcher.png | Launcher (ldpi) |
| mipmap-mdpi/ic_launcher.png | Launcher (mdpi) |
| mipmap-hdpi/ic_launcher.png | Launcher (hdpi, ~1.5×) |
| mipmap-xhdpi/ic_launcher.png | Launcher (xhdpi) |
| mipmap-xxhdpi/ic_launcher.png | Launcher (xxhdpi) |
| mipmap-xxxhdpi/ic_launcher.png | Launcher (xxxhdpi) |
| playstore-icon.png | Play Store listing |
| manifest.json | Generated metadata for the set |

### Desktop
| Filename | Purpose |
| --- | --- |
| icon-16.png | App icon (16×16) |
| icon-24.png | App icon (24×24) |
| icon-32.png | App icon (32×32) |
| icon-48.png | App icon (48×48) |
| icon-64.png | App icon (64×64) |
| icon-96.png | App icon (96×96) |
| icon-128.png | App icon (128×128) |
| icon-256.png | App icon (256×256) |
| icon-512.png | App icon (512×512) |
| icon-1024.png | App icon (1024×1024) |
| icon.ico | Windows icon bundle |
| icon.icns | macOS icon bundle |
| manifest.json | Generated metadata for the set |

## Manual Keys
> Tip: Helpful hints to make things easier
> Remember: Key ideas to keep in mind
> Warning: Avoid mistakes that cause trouble
> Technical Stuff: Deeper background info (optional)
