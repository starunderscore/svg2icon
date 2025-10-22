// IconGenerationService - Core icon generation logic (migrated from icon-generator.ts)

import type { GenerationResult, IconType } from '../types/Project.js';
import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

interface IconSize {
  name: string;
  size: number;
  scale?: number;
}

export class IconGenerationService {
  private readonly iconSizeMap: Record<IconType, IconSize[]> = {
    universal: [
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
    ],
    ios: [
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
    ],
    android: [
      { name: 'mipmap-ldpi/ic_launcher', size: 36 },
      { name: 'mipmap-mdpi/ic_launcher', size: 48 },
      { name: 'mipmap-hdpi/ic_launcher', size: 72 },
      { name: 'mipmap-xhdpi/ic_launcher', size: 96 },
      { name: 'mipmap-xxhdpi/ic_launcher', size: 144 },
      { name: 'mipmap-xxxhdpi/ic_launcher', size: 192 },
      { name: 'playstore-icon', size: 512 }
    ],
    desktop: [
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
    ],
    electron: [
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
    ],
    web: [
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
    ]
  };

  async generateIcons(svgData: string, outputPath: string, iconType: IconType): Promise<GenerationResult> {
    try {
      // This is a simplified implementation
      // In a real implementation, you would use @resvg/resvg-js to convert SVG to PNG
      
      const iconSizes = this.iconSizeMap[iconType];
      if (!iconSizes) {
        throw new Error(`Unknown icon type: ${iconType}`);
      }

      // Decode SVG data
      const svgBuffer = Buffer.from(svgData, 'base64');
      
      // Create output directory
      const iconOutputPath = this.createOutputPath(outputPath, iconType);
      
      // Generate each icon size
      let generatedCount = 0;
      const errors: string[] = [];

      for (const iconSpec of iconSizes) {
        try {
          await this.generateSingleIcon(svgBuffer, iconOutputPath, iconSpec);
          generatedCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to generate ${iconSpec.name}: ${errorMessage}`);
        }
      }

      // Generate special files for desktop/electron
      if (iconType === 'desktop' || iconType === 'electron') {
        try {
          await this.generateDesktopSpecialFiles(svgBuffer, iconOutputPath);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to generate special files: ${errorMessage}`);
        }
      }

      // Create manifest file
      await this.createManifest(iconOutputPath, iconType, iconSizes, svgData);

      const result: any = {
        success: true,
        message: `Successfully generated ${generatedCount} icons`,
        outputPath: iconOutputPath,
        filesGenerated: generatedCount,
      };
      if (errors.length > 0) result.errors = errors;
      return result;

    } catch (error) {
      console.error('Icon generation failed:', error);
      const errList = [error instanceof Error ? error.message : 'Unknown error'];
      return { success: false, message: errList[0], outputPath: undefined as any, filesGenerated: 0, errors: errList } as any;
    }
  }

  private createOutputPath(basePath: string, iconType: IconType): string {
    const outputPath = path.join(basePath, `${iconType}-icons`);
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    
    return outputPath;
  }

  private async generateSingleIcon(svgBuffer: Buffer, outputPath: string, iconSpec: IconSize): Promise<void> {
    try {
      // Import resvg dynamically
      const { Resvg } = await import('@resvg/resvg-js');
      
      // Convert SVG to PNG
      const resvg = new Resvg(svgBuffer, {
        background: 'rgba(0, 0, 0, 0)',
        fitTo: {
          mode: 'width',
          value: iconSpec.size
        }
      });
      
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      
      // Create subdirectories if needed
      const outputFilePath = path.join(outputPath, `${iconSpec.name}.png`);
      const outputDir = path.dirname(outputFilePath);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write PNG file
      fs.writeFileSync(outputFilePath, pngBuffer);
      
    } catch (error) {
      throw new Error(`Failed to generate ${iconSpec.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateDesktopSpecialFiles(svgBuffer: Buffer, outputPath: string): Promise<void> {
    // Generate ICO and ICNS files for desktop platforms
    // This would use png2icons or ImageMagick as fallback
    
    try {
      // Try png2icons first (optional dependency)
      const mod: any = await import('png2icons');
      const png2icons: any = mod.default ?? mod;
      
      // Generate different sizes for ICO/ICNS
      const icoSizes = [16, 24, 32, 48, 64, 128, 256];
      const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
      
      // Create PNG buffers for ICO generation
      const icoBuffers: Buffer[] = [];
      for (const size of icoSizes) {
        const buffer = await this.svgToPngBuffer(svgBuffer, size);
        if (buffer) icoBuffers.push(buffer);
      }
      
      // Create PNG buffers for ICNS generation  
      const icnsBuffers: Buffer[] = [];
      for (const size of icnsSizes) {
        const buffer = await this.svgToPngBuffer(svgBuffer, size);
        if (buffer) icnsBuffers.push(buffer);
      }
      
      // Generate ICO file for Windows
      if (icoBuffers.length > 0) {
        const icoData = png2icons.createICO(icoBuffers, png2icons.BEZIER, 0, false);
        if (icoData && icoData.length > 0) {
          fs.writeFileSync(path.join(outputPath, 'icon.ico'), icoData);
        }
      }
      
      // Generate ICNS file for macOS
      if (icnsBuffers.length > 0) {
        const icnsData = png2icons.createICNS(icnsBuffers, png2icons.BEZIER, 0);
        if (icnsData && icnsData.length > 0) {
          fs.writeFileSync(path.join(outputPath, 'icon.icns'), icnsData);
        }
      }
      
    } catch {
      // png2icons unavailable — try CLI fallbacks (ImageMagick/iconutil/png2icns)
      try {
        // Ensure we have the PNGs we need on disk (generateSingleIcon already wrote them)
        const icoSizes = [16, 24, 32, 48, 64, 128, 256];
        const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];

        const pngPathsICO = icoSizes
          .map((s) => path.join(outputPath, `icon-${s}.png`))
          .filter((p) => fs.existsSync(p));

        const pngPathsICNS = icnsSizes
          .map((s) => path.join(outputPath, `icon-${s}.png`))
          .filter((p) => fs.existsSync(p));

        // ICO via ImageMagick (magick or convert)
        if (pngPathsICO.length > 0) {
          const hasMagick = this.hasCmd('magick');
          const hasConvert = this.hasCmd('convert');
          if (hasMagick) {
            spawnSync('magick', [...pngPathsICO, path.join(outputPath, 'icon.ico')], { stdio: 'ignore' });
          } else if (hasConvert) {
            spawnSync('convert', [...pngPathsICO, path.join(outputPath, 'icon.ico')], { stdio: 'ignore' });
          }
        }

        // ICNS via iconutil (macOS) or png2icns (if installed)
        if (pngPathsICNS.length > 0) {
          if (process.platform === 'darwin' && this.hasCmd('iconutil')) {
            const iconsetDir = path.join(outputPath, 'icon.iconset');
            fs.mkdirSync(iconsetDir, { recursive: true });
            // Map sizes to icon.iconset expected names
            const map: Array<[number, string]> = [
              [16, 'icon_16x16.png'],
              [32, 'icon_16x16@2x.png'],
              [32, 'icon_32x32.png'],
              [64, 'icon_32x32@2x.png'],
              [128, 'icon_128x128.png'],
              [256, 'icon_128x128@2x.png'],
              [256, 'icon_256x256.png'],
              [512, 'icon_256x256@2x.png'],
              [512, 'icon_512x512.png'],
              [1024, 'icon_512x512@2x.png'],
            ];
            for (const [size, filename] of map) {
              const src = path.join(outputPath, `icon-${size}.png`);
              if (fs.existsSync(src)) {
                fs.copyFileSync(src, path.join(iconsetDir, filename));
              }
            }
            spawnSync('iconutil', ['-c', 'icns', iconsetDir, '-o', path.join(outputPath, 'icon.icns')], { stdio: 'ignore' });
          } else if (this.hasCmd('png2icns')) {
            // png2icns icon.icns icon-16.png ... icon-1024.png
            spawnSync('png2icns', [path.join(outputPath, 'icon.icns'), ...pngPathsICNS], { stdio: 'ignore' });
          }
        }
      } catch {
        // Ignore if fallbacks not available
      }
    }
  }

  private hasCmd(cmd: string): boolean {
    try {
      const res = spawnSync(cmd, ['-version'], { stdio: 'ignore' });
      return res.status === 0 || res.error === undefined;
    } catch {
      return false;
    }
  }

  private async svgToPngBuffer(svgBuffer: Buffer, size: number): Promise<Buffer | null> {
    try {
      const { Resvg } = await import('@resvg/resvg-js');
      
      const resvg = new Resvg(svgBuffer, {
        background: 'rgba(0, 0, 0, 0)',
        fitTo: {
          mode: 'width',
          value: size
        }
      });
      
      const pngData = resvg.render();
      return pngData.asPng();
    } catch (error) {
      console.error(`Failed to generate ${size}px PNG:`, error);
      return null;
    }
  }

  private async createManifest(outputPath: string, iconType: IconType, iconSizes: IconSize[], svgData: string): Promise<void> {
    const manifest = {
      generated: new Date().toISOString(),
      iconType: iconType,
      svgDataIncluded: true,
      icons: iconSizes.map(spec => ({
        name: `${spec.name}.png`,
        size: `${spec.size}x${spec.size}`,
        type: 'png'
      })),
      additionalFiles: [] as Array<{ name: string; type: string; description: string }>
    };

    // Add special files to manifest
    if (iconType === 'desktop' || iconType === 'electron') {
      const icoPath = path.join(outputPath, 'icon.ico');
      const icnsPath = path.join(outputPath, 'icon.icns');
      
      if (fs.existsSync(icoPath)) {
        manifest.additionalFiles.push({
          name: 'icon.ico',
          type: 'ico',
          description: 'Windows icon file'
        });
      }
      
      if (fs.existsSync(icnsPath)) {
        manifest.additionalFiles.push({
          name: 'icon.icns',
          type: 'icns',
          description: 'macOS icon file'
        });
      }
    }

    // Write manifest
    fs.writeFileSync(
      path.join(outputPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Also save the original SVG
    const svgContent = Buffer.from(svgData, 'base64').toString('utf-8');
    fs.writeFileSync(
      path.join(outputPath, 'original.svg'),
      svgContent
    );
  }

  getIconTypeInfo(iconType: IconType): { name: string; description: string; badge: string } {
    const infoMap: Record<string, { name: string; description: string; badge: string }> = {
      universal: { name: 'Universal', description: 'Complete cross-platform package', badge: '🌐' },
      ios: { name: 'iOS', description: 'App Store ready', badge: '📱' },
      android: { name: 'Android', description: 'Google Play ready', badge: '🤖' },
      desktop: { name: 'Desktop', description: 'Windows, macOS, Linux', badge: '🖥️' },
      electron: { name: 'Electron', description: 'Electron app ready', badge: '⚡' },
      web: { name: 'Web', description: 'PWA and web ready', badge: '🌍' }
    };
    return infoMap[iconType] || infoMap['universal'];
  }
}
