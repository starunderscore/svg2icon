# 🚀 SVG2Icon

A powerful desktop application built with Electron and TypeScript that converts SVG files into complete PNG icon sets for mobile, desktop, and web app development.

## ✨ Features

- **🎨 SVG to PNG Conversion** - High-quality vector to raster conversion with resvg
- **📱 Mobile-Ready Icon Sets** - Generate all required sizes for iOS and Android
- **🌍 Universal Mode** - Organized folders for mobile/desktop/web platforms
- **🎯 Six Target Platforms**:
  - **Universal** - Complete cross-platform package with organized folders
  - **iOS App Icons** - All required sizes for App Store submission
  - **Android App Icons** - Complete density folder structure  
  - **Desktop App Icons** - Windows ICO, macOS ICNS, Linux PNG ready
  - **Electron App Icons** - Electron-builder ready with assets/ structure
  - **Web App Icons** - PWA manifests, favicons, and touch icons
- **🖼️ Live Preview** - See your SVG before conversion
- **📁 Organized Output** - Proper folder structure with detailed manifest
- **⚡ Automatic ICO/ICNS Creation** - png2icons + ImageMagick fallback
- **🐧 Cross-Platform** - Works on Windows, macOS, and Linux
- **🎨 Modern UI** - Beautiful, intuitive Electron interface with theme support
- **📊 Telemetry** - Anonymous usage tracking for development insights

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/svg2icon
   cd svg2icon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up PostHog (optional):**
   - Get your API key from PostHog
   - Replace `YOUR_API_KEY_HERE` in `src/renderer/services/TelemetryService.js`

4. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

### Development Mode

```bash
npm run dev
```

## 📋 Universal Icon Sets

The **Universal** option creates organized folders for different platforms:

```
universal-icons/
├── mobile/
│   ├── ios/          # iOS App Store icons
│   └── android/      # Android density folders
├── desktop/          # Windows ICO, macOS ICNS, Linux PNG
└── web/             # PWA manifests, favicons, touch icons
```

### iOS App Icons
- **iPhone**: 60x60, 120x120, 180x180
- **iPad**: 76x76, 152x152, 167x167
- **Universal**: 20x20, 29x29, 40x40 (1x, 2x, 3x)
- **App Store**: 1024x1024

### Android App Icons
- **LDPI to XXXHDPI**: Complete density coverage
- **Play Store**: 512x512

### Desktop App Icons
- **Windows ICO**: Auto-generated
- **macOS ICNS**: Auto-generated
- **Linux PNG**: 512x512

### Web App Icons (PWA)
- **Favicons**: 16x16, 32x32
- **Apple Touch Icons**: Complete set
- **PWA Manifest**: 192x192, 512x512

## 🎯 Usage

1. **Launch the app** using `npm start`
2. **Select your SVG file** - Click "Select SVG File" and choose your vector icon
3. **Choose icon type** - Select from Universal, iOS, Android, Desktop, Web
4. **Set output folder** - Click "Choose Output Folder" to specify where icons will be saved
5. **Generate icons** - Click "Generate Icons" and wait for processing to complete

## ⚙️ Development

### Project Structure

```
svg2icon/
├── src/
│   ├── main.ts                    # Main Electron process
│   ├── icon-generator.ts          # Core conversion logic
│   └── renderer/
│       ├── index.html             # UI interface
│       ├── styles.css             # Application styles
│       ├── renderer.js            # Main orchestrator
│       ├── services/
│       │   ├── TelemetryService.js    # PostHog tracking
│       │   ├── SettingsManager.js     # App settings
│       │   └── FileManager.js         # File operations
│       └── ui/
│           └── UIManager.js           # UI state management
├── dist/                          # Compiled TypeScript output
├── package.json
├── tsconfig.json
└── README.md
```

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Build and run the app
- `npm run dev` - Run in development mode with DevTools
- `npm run pack` - Package the app (without installer)
- `npm run dist` - Create distributable installer

### Building for Distribution

```bash
# Build for current platform
npm run dist

# The packaged app will be in the 'release' folder
```

For platform-specific prerequisites and commands (Windows NSIS, Linux AppImage/DEB/RPM), see `BUILDING.md`.

## 🛠️ Technical Details

### Dependencies

- **Electron** - Cross-platform desktop app framework
- **TypeScript** - Type-safe JavaScript development
- **@resvg/resvg-js** - Primary SVG to PNG conversion
- **png2icons** - ICO and ICNS file generation
- **ImageMagick** - Fallback ICO/ICNS creation (auto-detected)
- **PostHog** - Anonymous usage analytics

### Smart Fallback System

The app uses multiple methods for optimal icon generation:
1. **png2icons** (if available) → Fastest, best quality ICO/ICNS
2. **ImageMagick** (if installed) → Universal, reliable fallback  
3. **Manual instructions** → Always provided as backup option

### Cross-Platform Support

- **Linux**: Full ICO/ICNS generation with ImageMagick
- **macOS**: Native iconutil support + ImageMagick fallback
- **Windows**: Complete ICO generation with all tools

### Architecture

- **Main Process** (`main.ts`) - Handles file system operations and app lifecycle
- **Renderer Process** (`renderer.js`) - Manages the user interface and orchestrates services
- **SVG2Icon** (`icon-generator.ts`) - Core conversion and sizing logic
- **Services** - Modular components for telemetry, settings, files, and UI

## 🎨 Customization

### Adding New Icon Sizes

Edit the size arrays in `src/icon-generator.ts`:

```typescript
const customIconSizes: IconSize[] = [
  { name: 'custom-size', size: 150 },
  // Add your custom sizes here
];
```

### Modifying the UI

The interface is built with vanilla HTML/CSS/JS. Customize styling in `src/renderer/styles.css`.

### Telemetry Configuration

To set up PostHog analytics:
1. Sign up at [PostHog](https://posthog.com)
2. Get your API key
3. Replace `YOUR_API_KEY_HERE` in `src/renderer/services/TelemetryService.js`

## 🐛 Troubleshooting

### Common Issues

**SVG not displaying in preview:**
- Ensure your SVG file is valid and not corrupted
- Try opening the SVG in a web browser first

**ICO/ICNS generation failed:**
- Install ImageMagick: `sudo apt install imagemagick` (Linux)
- Install png2icons: `npm install png2icons`
- Manual conversion instructions provided in generated README

**Installation fails:**
- Make sure you have Node.js v16 or higher
- Try clearing npm cache: `npm cache clean --force`

**Linux-specific issues:**
- Install ImageMagick with full format support
- GLib/GTK warnings are normal and can be ignored

**App won't start:**
- Run `npm run build` before `npm start`
- Check the console for TypeScript compilation errors

## 📄 License

MIT License

Copyright (c) 2024 StarUnderscore.com (Michael Hunt)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test them
4. Commit your changes: `git commit -am 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Image processing by [Sharp](https://sharp.pixelplumbing.com/)
- SVG rendering by [resvg](https://github.com/RazrFalcon/resvg)
- Analytics by [PostHog](https://posthog.com)

---

**Made with ❤️ by StarUnderscore.com**  
**✨ A cozy, simple MIT licensed app for the developer community**
