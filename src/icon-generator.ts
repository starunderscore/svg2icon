import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Import Resvg with proper error handling
let Resvg: any;
try {
  const resvgModule = require('@resvg/resvg-js');
  Resvg = resvgModule.Resvg;
} catch (error) {
  console.error('Failed to import @resvg/resvg-js:', error);
  throw new Error('Required dependency @resvg/resvg-js is not properly installed. Run: npm install @resvg/resvg-js');
}

// Import png2icons with proper typing
let png2icons: any;
try {
  png2icons = require('png2icons');
} catch (error) {
  console.warn('png2icons not available, will try ImageMagick fallback');
}

interface IconSize {
  name: string;
  size: number;
  scale?: number;
}

// iOS App Icon Sizes
const iosIconSizes: IconSize[] = [
  { name: 'icon-20@1x', size: 20 },
  { name: 'icon-20@2x', size: 40 },
  { name: 'icon-20@3x', size: 60 },
  { name: 'icon-29@1x', size: 29 },
  { name: 'icon-29@2x', size: 58 },
  { name: 'icon-29@3x', size: 87 },
  { name: 'icon-40@1x', size: 40 },
  { name: 'icon-40@2x', size: 80 },
  { name: 'icon-40@3x', size: 120 },
  { name: 'icon-60@2x', size: 120 },
  { name: 'icon-60@3x', size: 180 },
  { name: 'icon-76@1x', size: 76 },
  { name: 'icon-76@2x', size: 152 },
  { name: 'icon-83.5@2x', size: 167 },
  { name: 'icon-1024@1x', size: 1024 }
];

// Android App Icon Sizes
const androidIconSizes: IconSize[] = [
  { name: 'mipmap-ldpi/ic_launcher', size: 36 },
  { name: 'mipmap-mdpi/ic_launcher', size: 48 },
  { name: 'mipmap-hdpi/ic_launcher', size: 72 },
  { name: 'mipmap-xhdpi/ic_launcher', size: 96 },
  { name: 'mipmap-xxhdpi/ic_launcher', size: 144 },
  { name: 'mipmap-xxxhdpi/ic_launcher', size: 192 },
  { name: 'playstore-icon', size: 512 }
];

// Desktop Application Icons
const desktopIconSizes: IconSize[] = [
  { name: 'icon-16', size: 16 },
  { name: 'icon-24', size: 24 },
  { name: 'icon-32', size: 32 },
  { name: 'icon-48', size: 48 },
  { name: 'icon-64', size: 64 },
  { name: 'icon-96', size: 96 },
  { name: 'icon-128', size: 128 },
  { name: 'icon-256', size: 256 },
  { name: 'icon-512', size: 512 },
  { name: 'icon-1024', size: 1024 }
];

// Electron App Icons (ready for electron-builder)
const electronIconSizes: IconSize[] = [
  { name: 'assets/icon', size: 512 },
  { name: 'assets/icon@2x', size: 256 },
  { name: 'assets/icon-1024', size: 1024 },
  { name: 'assets/ico/icon-16', size: 16 },
  { name: 'assets/ico/icon-24', size: 24 },
  { name: 'assets/ico/icon-32', size: 32 },
  { name: 'assets/ico/icon-48', size: 48 },
  { name: 'assets/ico/icon-64', size: 64 },
  { name: 'assets/ico/icon-128', size: 128 },
  { name: 'assets/ico/icon-256', size: 256 }
];

// Web App Icons (PWA)
const webIconSizes: IconSize[] = [
  { name: 'favicon-16', size: 16 },
  { name: 'favicon-32', size: 32 },
  { name: 'apple-touch-icon-57', size: 57 },
  { name: 'apple-touch-icon-60', size: 60 },
  { name: 'apple-touch-icon-72', size: 72 },
  { name: 'apple-touch-icon-76', size: 76 },
  { name: 'apple-touch-icon-114', size: 114 },
  { name: 'apple-touch-icon-120', size: 120 },
  { name: 'apple-touch-icon-144', size: 144 },
  { name: 'apple-touch-icon-152', size: 152 },
  { name: 'apple-touch-icon-180', size: 180 },
  { name: 'manifest-192', size: 192 },
  { name: 'manifest-512', size: 512 }
];

// Universal Mobile & Desktop Sizes
const universalIconSizes: IconSize[] = [
  { name: 'icon-16', size: 16 },
  { name: 'icon-24', size: 24 },
  { name: 'icon-32', size: 32 },
  { name: 'icon-48', size: 48 },
  { name: 'icon-64', size: 64 },
  { name: 'icon-72', size: 72 },
  { name: 'icon-96', size: 96 },
  { name: 'icon-120', size: 120 },
  { name: 'icon-128', size: 128 },
  { name: 'icon-144', size: 144 },
  { name: 'icon-152', size: 152 },
  { name: 'icon-180', size: 180 },
  { name: 'icon-192', size: 192 },
  { name: 'icon-256', size: 256 },
  { name: 'icon-512', size: 512 },
  { name: 'icon-1024', size: 1024 }
];

function getIconSizes(iconType: string): IconSize[] {
  switch (iconType) {
    case 'ios':
      return iosIconSizes;
    case 'android':
      return androidIconSizes;
    case 'desktop':
      return desktopIconSizes;
    case 'electron':
      return electronIconSizes;
    case 'web':
      return webIconSizes;
    case 'universal':
      return universalIconSizes;
    default:
      return universalIconSizes;
  }
}

function convertSvgToPng(svgBuffer: Buffer, size: number): Buffer {
  const resvg = new Resvg(svgBuffer, {
    background: 'rgba(0, 0, 0, 0)',
    fitTo: {
      mode: 'width',
      value: size
    }
  });
  
  const pngData = resvg.render();
  return pngData.asPng();
}

function checkImageMagick(): boolean {
  try {
    execSync('convert -version', { stdio: 'ignore' });
    
    // Check if ICO format is supported
    try {
      const formats = execSync('convert -list format | grep -i ico', { encoding: 'utf8', stdio: 'pipe' });
      if (!formats.includes('ICO')) {
        console.warn('ImageMagick found but ICO support may be limited');
      }
    } catch (error) {
      console.warn('Could not check ImageMagick ICO support');
    }
    
    return true;
  } catch (error) {
    console.warn('ImageMagick not found. Install with: sudo apt install imagemagick');
    return false;
  }
}

function createIcoWithImageMagick(baseOutputPath: string, pngFiles: string[]): boolean {
  try {
    const icoPath = path.join(baseOutputPath, 'icon.ico');
    // Use quotes around each file path to handle spaces
    const quotedFiles = pngFiles.map(file => `"${file}"`).join(' ');
    const command = `convert ${quotedFiles} "${icoPath}"`;
    
    console.log('Running ICO command:', command);
    execSync(command, { stdio: 'pipe' });
    
    // Verify the file was created and has content
    if (fs.existsSync(icoPath) && fs.statSync(icoPath).size > 0) {
      console.log('Generated: icon.ico (Windows) using ImageMagick');
      return true;
    } else {
      throw new Error('ICO file was not created or is empty');
    }
  } catch (error) {
    console.warn('ImageMagick ICO creation failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

function createIcnsWithImageMagick(baseOutputPath: string): boolean {
  try {
    // On Linux, we'll create a basic ICNS using ImageMagick convert
    // This won't be as perfect as iconutil but will work cross-platform
    const icnsPath = path.join(baseOutputPath, 'icon.icns');
    
    // Get the required sizes for ICNS
    const icnsFiles = [
      'icon-16.png', 'icon-32.png', 'icon-64.png', 
      'icon-128.png', 'icon-256.png', 'icon-512.png', 'icon-1024.png'
    ]
      .map(file => path.join(baseOutputPath, file))
      .filter(file => fs.existsSync(file))
      .map(file => `"${file}"`)
      .join(' ');
    
    if (icnsFiles.length === 0) {
      throw new Error('No PNG files found for ICNS creation');
    }
    
    // Try to create ICNS using ImageMagick
    const command = `convert ${icnsFiles} "${icnsPath}"`;
    console.log('Running ICNS command:', command);
    execSync(command, { stdio: 'pipe' });
    
    // Verify the file was created and has content
    if (fs.existsSync(icnsPath) && fs.statSync(icnsPath).size > 0) {
      console.log('Generated: icon.icns (macOS) using ImageMagick');
      return true;
    } else {
      throw new Error('ICNS file was not created or is empty');
    }
    
  } catch (error) {
    console.warn('ImageMagick ICNS creation failed:', error instanceof Error ? error.message : String(error));
    
    // Fallback: Try using png2icns if available
    try {
      console.log('Attempting ICNS with png2icns...');
      const png2icnsCommand = `png2icns "${path.join(baseOutputPath, 'icon.icns')}" "${path.join(baseOutputPath, 'icon-1024.png')}"`;
      execSync(png2icnsCommand, { stdio: 'ignore' });
      console.log('Generated: icon.icns (macOS) using png2icns');
      return true;
    } catch (fallbackError) {
      console.warn('png2icns also failed:', fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
      return false;
    }
  }
}

async function generateDesktopSpecialFiles(baseOutputPath: string, svgBuffer: Buffer, iconType: string): Promise<void> {
  let icoGenerated = false;
  let icnsGenerated = false;
  
  // Try png2icons first (if available)
  if (png2icons) {
    try {
      console.log('Attempting ICO/ICNS generation with png2icons...');
      
      const icoSizes = [16, 24, 32, 48, 64, 128, 256];
      const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
      
      // Create PNG buffers for ICO generation
      const icoBuffers: Buffer[] = [];
      for (const size of icoSizes) {
        const buffer = convertSvgToPng(svgBuffer, size);
        if (buffer && buffer.length > 0) {
          icoBuffers.push(buffer);
        }
      }
      
      // Create PNG buffers for ICNS generation  
      const icnsBuffers: Buffer[] = [];
      for (const size of icnsSizes) {
        const buffer = convertSvgToPng(svgBuffer, size);
        if (buffer && buffer.length > 0) {
          icnsBuffers.push(buffer);
        }
      }
      
      // Generate ICO file for Windows
      if (icoBuffers.length > 0) {
        const icoData = png2icons.createICO(icoBuffers, png2icons.BEZIER, 0, false);
        if (icoData && icoData.length > 0) {
          fs.writeFileSync(path.join(baseOutputPath, 'icon.ico'), icoData);
          console.log('Generated: icon.ico (Windows) using png2icons');
          icoGenerated = true;
        }
      }
      
      // Generate ICNS file for macOS
      if (icnsBuffers.length > 0) {
        const icnsData = png2icons.createICNS(icnsBuffers, png2icons.BEZIER, 0);
        if (icnsData && icnsData.length > 0) {
          fs.writeFileSync(path.join(baseOutputPath, 'icon.icns'), icnsData);
          console.log('Generated: icon.icns (macOS) using png2icons');
          icnsGenerated = true;
        }
      }
    } catch (error) {
      console.warn('png2icons failed:', error instanceof Error ? error.message : String(error));
    }
  }
  
  // Fall back to ImageMagick if png2icons failed or isn't available
  const hasImageMagick = checkImageMagick();
  
  if (!icoGenerated && hasImageMagick) {
    console.log('Attempting ICO generation with ImageMagick...');
    const icoFiles = ['icon-16.png', 'icon-24.png', 'icon-32.png', 'icon-48.png', 'icon-64.png', 'icon-128.png', 'icon-256.png']
      .map(file => path.join(baseOutputPath, file))
      .filter(file => fs.existsSync(file));
    
    if (icoFiles.length > 0) {
      icoGenerated = createIcoWithImageMagick(baseOutputPath, icoFiles);
    }
  }
  
  if (!icnsGenerated && hasImageMagick) {
    console.log('Attempting ICNS generation with ImageMagick...');
    icnsGenerated = createIcnsWithImageMagick(baseOutputPath);
  }
  
  // Summary
  console.log('\n🎯 Icon Generation Summary:');
  console.log(`   ICO file: ${icoGenerated ? '✅ Generated' : '❌ Failed'}`);
  console.log(`   ICNS file: ${icnsGenerated ? '✅ Generated' : '❌ Failed'}`);
  
  if (!icoGenerated || !icnsGenerated) {
    console.log('\n💡 Manual options available in README.md');
  }
  
  // Create comprehensive README
  const isElectron = iconType === 'electron';
  const readmeContent = `# ${isElectron ? 'Electron' : 'Desktop'} App Icons - Complete Package!

## ✅ Generated Files

### 🖥️ **Ready to Use:**
- \`icon.ico\` - Windows icon file ${icoGenerated ? '(✅ COMPLETE)' : '(❌ Manual conversion needed)'}
- \`icon.icns\` - macOS icon file ${icnsGenerated ? '(✅ COMPLETE)' : '(❌ Manual conversion needed)'}
- \`icon-512.png\` - Linux icon file (✅ COMPLETE)
- \`icon-256.png\` - Standard app icon (✅ COMPLETE)

### 📁 **Individual PNG Files:**
All sizes from 16x16 to 1024x1024 available for any custom needs.

## 🚀 **Usage Instructions:**

### **For Electron Apps:**
\`\`\`bash
# Copy icons to your Electron project root
cp icon.ico /path/to/your/electron/project/
cp icon.icns /path/to/your/electron/project/
cp icon-512.png /path/to/your/electron/project/icon.png
\`\`\`

### **Update package.json:**
\`\`\`json
{
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "Your App Name",
    "mac": {
      "icon": "icon.icns"
    },
    "win": {
      "icon": "icon.ico"
    },
    "linux": {
      "icon": "icon.png"
    }
  }
}
\`\`\`

${(!icoGenerated || !icnsGenerated) ? `
## ⚠️ **Manual ICO/ICNS Generation:**

### **Install ImageMagick:**
\`\`\`bash
sudo apt install imagemagick     # Ubuntu/Debian
brew install imagemagick        # macOS
\`\`\`

### **Create ICO file:**
\`\`\`bash
convert icon-16.png icon-24.png icon-32.png icon-48.png icon-64.png icon-128.png icon-256.png icon.ico
\`\`\`

### **Create ICNS file (macOS only):**
\`\`\`bash
mkdir icon.iconset
cp icon-16.png icon.iconset/icon_16x16.png
cp icon-32.png icon.iconset/icon_16x16@2x.png
cp icon-32.png icon.iconset/icon_32x32.png
cp icon-64.png icon.iconset/icon_32x32@2x.png
cp icon-128.png icon.iconset/icon_128x128.png
cp icon-256.png icon.iconset/icon_128x128@2x.png
cp icon-256.png icon.iconset/icon_256x256.png
cp icon-512.png icon.iconset/icon_256x256@2x.png
cp icon-512.png icon.iconset/icon_512x512.png
cp icon-1024.png icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o icon.icns
rm -rf icon.iconset
\`\`\`
` : ''}

---
**Generated by Icon Generator - Production Ready! 🚀**
`;

  fs.writeFileSync(path.join(baseOutputPath, 'README.md'), readmeContent);
  console.log('Generated: README.md with complete setup instructions');
}

export async function generateIconSet(svgPath: string, outputPath: string, iconType: string): Promise<void> {
  try {
    // Read SVG file
    const svgBuffer = fs.readFileSync(svgPath);
    const iconSizes = getIconSizes(iconType);
    
    // Create output directory structure
    const baseOutputPath = path.join(outputPath, `${iconType}-icons`);
    if (!fs.existsSync(baseOutputPath)) {
      fs.mkdirSync(baseOutputPath, { recursive: true });
    }
    
    // Generate icons for each size
    for (const iconSpec of iconSizes) {
      const pngBuffer = convertSvgToPng(svgBuffer, iconSpec.size);
      
      // Create subdirectories for complex structures
      const outputFilePath = path.join(baseOutputPath, `${iconSpec.name}.png`);
      const outputDir = path.dirname(outputFilePath);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputFilePath, pngBuffer);
      console.log(`Generated: ${iconSpec.name}.png (${iconSpec.size}x${iconSpec.size})`);
    }
    
    // Special handling for Electron and Desktop icons (both get ICO/ICNS)
    if (iconType === 'electron') {
      // For electron icons, create assets folder structure
      const assetsPath = path.join(baseOutputPath, 'assets');
      if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath, { recursive: true });
      }
      
      await generateDesktopSpecialFiles(baseOutputPath, svgBuffer, iconType);
      
      // Move files to assets folder for electron structure
      if (fs.existsSync(path.join(baseOutputPath, 'icon.ico'))) {
        fs.renameSync(
          path.join(baseOutputPath, 'icon.ico'),
          path.join(assetsPath, 'icon.ico')
        );
      }
      
      if (fs.existsSync(path.join(baseOutputPath, 'icon.icns'))) {
        fs.renameSync(
          path.join(baseOutputPath, 'icon.icns'),
          path.join(assetsPath, 'icon.icns')
        );
      }
    } else if (iconType === 'desktop') {
      await generateDesktopSpecialFiles(baseOutputPath, svgBuffer, iconType);
    }
    
    // Generate a manifest file with icon information
    const manifest: {
      generated: string;
      iconType: string;
      sourceFile: string;
      icons: Array<{ name: string; size: string; type: string }>;
      additionalFiles: Array<{ name: string; type: string; description: string }>;
    } = {
      generated: new Date().toISOString(),
      iconType: iconType,
      sourceFile: path.basename(svgPath),
      icons: iconSizes.map(spec => ({
        name: `${spec.name}.png`,
        size: `${spec.size}x${spec.size}`,
        type: 'png'
      })),
      additionalFiles: []
    };
    
    // Add ICO/ICNS files to manifest if they were generated
    if (iconType === 'desktop' || iconType === 'electron') {
      const icoPath = iconType === 'electron' 
        ? path.join(baseOutputPath, 'assets', 'icon.ico')
        : path.join(baseOutputPath, 'icon.ico');
      const icnsPath = iconType === 'electron'
        ? path.join(baseOutputPath, 'assets', 'icon.icns') 
        : path.join(baseOutputPath, 'icon.icns');
        
      if (fs.existsSync(icoPath)) {
        manifest.additionalFiles.push({
          name: iconType === 'electron' ? 'assets/icon.ico' : 'icon.ico',
          type: 'ico',
          description: 'Windows icon file'
        });
      }
      
      if (fs.existsSync(icnsPath)) {
        manifest.additionalFiles.push({
          name: iconType === 'electron' ? 'assets/icon.icns' : 'icon.icns', 
          type: 'icns',
          description: 'macOS icon file'
        });
      }
      
      // Add README
      manifest.additionalFiles.push({
        name: 'README.md',
        type: 'documentation',
        description: 'Setup instructions and manual conversion options'
      });
    }
    
    fs.writeFileSync(
      path.join(baseOutputPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`Icon set generation complete! Generated ${iconSizes.length} icons.`);
  } catch (error) {
    console.error('Error in generateIconSet:', error);
    throw error;
  }
}