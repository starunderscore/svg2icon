# 🚀 Icon Generator

A powerful desktop application built with Electron and TypeScript that converts SVG files into complete PNG icon sets for mobile, desktop, and web app development.

![Icon Generator Screenshot](https://via.placeholder.com/600x400/667eea/ffffff?text=Icon+Generator+App)

## ✨ Features

- **🎨 SVG to PNG Conversion** - High-quality vector to raster conversion with resvg
- **📱 Mobile-Ready Icon Sets** - Generate all required sizes for iOS and Android
- **🎯 Six Target Platforms**:
  - **iOS App Icons** - All required sizes for App Store submission
  - **Android App Icons** - Complete density folder structure  
  - **Desktop App Icons** - Windows ICO, macOS ICNS, Linux PNG ready
  - **Electron App Icons** - Electron-builder ready with assets/ structure
  - **Web App Icons** - PWA manifests, favicons, and touch icons
  - **Universal Icons** - Complete cross-platform compatibility
- **🖼️ Live Preview** - See your SVG before conversion
- **📁 Organized Output** - Proper folder structure with detailed manifest
- **⚡ Automatic ICO/ICNS Creation** - png2icons + ImageMagick fallback
- **🐧 Cross-Platform** - Works on Windows, macOS, and Linux
- **🎨 Modern UI** - Beautiful, intuitive Electron interface

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or create the project directory:**
   ```bash
   mkdir icon-generator-app
   cd icon-generator-app
   ```

2. **Initialize and install dependencies:**
   ```bash
   npm init -y
   npm install --save-dev electron typescript @types/node electron-builder
   npm install sharp @resvg/resvg-js png2icons
   ```

3. **Add the project files** (copy all the TypeScript and HTML files from the artifacts)

4. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

### Development Mode

```bash
npm run dev
```

## 📋 Icon Sets Generated

### iOS App Icons
- **iPhone**: 60x60, 120x120, 180x180
- **iPad**: 76x76, 152x152, 167x167
- **Universal**: 20x20, 29x29, 40x40 (1x, 2x, 3x)
- **App Store**: 1024x1024

### Android App Icons
- **LDPI**: 36x36
- **MDPI**: 48x48
- **HDPI**: 72x72
- **XHDPI**: 96x96
- **XXHDPI**: 144x144
- **XXXHDPI**: 192x192
- **Play Store**: 512x512

### Desktop App Icons
- **Windows ICO**: 16x16, 24x24, 32x32, 48x48, 64x64, 96x96, 128x128, 256x256, 512x512
- **macOS App Bundle**: 1024x1024
- **Linux Desktop**: All standard sizes
- **General Purpose**: Perfect for any desktop application

### Electron App Icons
- **Electron-builder Structure**: Ready-to-use assets/ folder
- **Auto ICO/ICNS**: Automatic .ico and .icns file generation
- **Perfect Layout**: icon.png, icon@2x.png, icon-1024.png structure
- **Cross-Platform**: Works on Linux, Windows, and macOS
- **Zero Config**: Drop into your Electron project and build

### Web App Icons (PWA)
- **Favicons**: 16x16, 32x32
- **Apple Touch Icons**: 57x57 to 180x180
- **PWA Manifest**: 192x192, 512x512
- **Web App Install Ready**: Complete PWA icon set

### Universal Icons
Complete set from 16x16 to 1024x1024 for maximum compatibility across all platforms.

## 🎯 Usage

1. **Launch the app** using `npm start`
2. **Select your SVG file** - Click "Select SVG File" and choose your vector icon
3. **Choose icon type** - Select from iOS, Android, Desktop, Electron, Web, or Universal
4. **Set output folder** - Click "Choose Output Folder" to specify where icons will be saved
5. **Generate icons** - Click "Generate Icons" and wait for processing to complete

### 📁 Need Example SVG Files?

Check out the [examples folder](examples/) for sample SVG icons and a complete guide on creating icons that convert well across all sizes.

### Output Structure

```
your-output-folder/
├── desktop-icons/           # Complete desktop package
│   ├── icon.ico            # Windows icon file (auto-generated)
│   ├── icon.icns           # macOS icon file (auto-generated)
│   ├── icon-16.png         # Individual PNG sizes
│   ├── icon-32.png         # ... all desktop sizes
│   ├── icon-256.png        # Standard app icon
│   ├── icon-512.png        # Linux icon
│   ├── icon-1024.png       # High-resolution
│   ├── README.md           # Setup instructions
│   └── manifest.json       # Complete file inventory
```

## ⚙️ Development

### Project Structure

```
icon-generator-app/
├── src/
│   ├── main.ts              # Main Electron process
│   ├── icon-generator.ts    # Core conversion logic
│   └── renderer/
│       ├── index.html       # UI interface
│       └── renderer.js      # Frontend logic
├── dist/                    # Compiled TypeScript output
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

## 🛠️ Technical Details

### Dependencies

- **Electron** - Cross-platform desktop app framework
- **TypeScript** - Type-safe JavaScript development
- **@resvg/resvg-js** - Primary SVG to PNG conversion
- **png2icons** - ICO and ICNS file generation
- **ImageMagick** - Fallback ICO/ICNS creation (auto-detected)

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
- **Renderer Process** (`renderer.js`) - Manages the user interface
- **Icon Generator** (`icon-generator.ts`) - Core conversion and sizing logic

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

The interface is built with vanilla HTML/CSS/JS in `src/renderer/`. Customize the styling in the `<style>` section of `index.html`.

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

MIT License - feel free to use this project for personal or commercial purposes.

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

---

**Made with ❤️ for app developers everywhere**  
**✨ Enhanced with automatic ICO/ICNS generation and cross-platform support**