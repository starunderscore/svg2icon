# Web Icons

Everything you need for websites. Place these files on your site and reference them with standard meta/link tags.

Output folder: `web/`
- Favicons (`favicon-16.png`, `favicon-32.png`, `favicon.ico`)
- Apple touch icons (including `apple-touch-icon-180.png`)
- Large PNGs for Android/Chrome prompts (`manifest-192.png`, `manifest-512.png`)
- Reference file: `icons-head.html`

## Choose Web
From the project row, click the Web download to create the web package ZIP.

![Click Web download](images/generating-icons/web/view-web-button-download-view1.png)

## Save the ZIP
Choose where to save. Inside the ZIP you’ll find `{project}_web/` (a ` (n)` suffix is added when a folder already exists).

## Web folder (inside ZIP)
After you extract the ZIP, open the `web/` folder to see all files.

![ZIP file dialog](images/generating-icons/web/zipfile-web-view2.png)

## Reference in HTML
```html
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="16x16" href="/web/favicon-16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/web/favicon-32.png">
<link rel="icon" href="/web/favicon.ico">

<!-- Apple touch icon (general) -->
<link rel="apple-touch-icon" href="/web/apple-touch-icon-180.png">

<!-- Android/Chrome (install prompts) -->
<link rel="icon" type="image/png" sizes="192x192" href="/web/manifest-192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/web/manifest-512.png">

<!-- Optional: browser UI color -->
<meta name="theme-color" content="#000000">
```

> Remember: `web/icons-head.html` contains the full set of tags you can copy into your page’s `<head>`.

> Technical Stuff: The `web/manifest.json` file in your bundle is generator metadata, not a full web app manifest. If you need a PWA manifest, create one for your site and point to it separately.
