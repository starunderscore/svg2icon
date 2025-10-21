// Electron main process - SVG2Icon v1.1.0

import { BrowserWindow, ipcMain, dialog, app, Menu } from 'electron';
import { StorageService } from './storage.js';
import { IconGenerationService } from '../services/IconGenerationService.js';
import type { Project, CreateProjectData, UpdateProjectData } from '../types/Project.js';

export class ElectronMain {
  private window: BrowserWindow;
  private storageService: StorageService;
  private iconGenerationService: IconGenerationService;

  constructor(window: BrowserWindow) {
    this.window = window;
    this.storageService = new StorageService();
    this.iconGenerationService = new IconGenerationService();
    
    this.setupIpcHandlers();
    this.setupMenu();
  }

  private setupIpcHandlers(): void {
    // Project operations
    ipcMain.handle('projects:getAll', async () => {
      try {
        return await this.storageService.getAllProjects();
      } catch (error) {
        console.error('Failed to get projects:', error);
        return [];
      }
    });

    ipcMain.handle('projects:create', async (_event, data: any) => {
      try {
        const project: Omit<Project, 'id'> = {
          name: data.name,
          svgPath: '',
          svgData: data.svgData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          iconTypes: data.iconTypes || data.initialIconTypes || ['universal']
        };
        
        return await this.storageService.createProject(project);
      } catch (error) {
        console.error('Failed to create project:', error);
        throw error;
      }
    });

    ipcMain.handle('projects:update', async (event, id: string, data: UpdateProjectData) => {
      try {
        return await this.storageService.updateProject(id, {
          ...data,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to update project:', error);
        throw error;
      }
    });

    ipcMain.handle('projects:delete', async (event, id: string) => {
      try {
        return await this.storageService.deleteProject(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
        return false;
      }
    });

    ipcMain.handle('projects:generateIcons', async (_event, id: string, iconType: string) => {
      try {
        const project = await this.storageService.getProjectById(id);
        if (!project) {
          throw new Error('Project not found');
        }
        // Centralized output path under userData
        const path = require('path');
        const fs = require('fs');
        const baseDir = path.join(app.getPath('userData'), 'svg2icon', 'projects', id);
        fs.mkdirSync(baseDir, { recursive: true });
        
        // Generate icons
        const generationResult = await this.iconGenerationService.generateIcons(
          project.svgData,
          baseDir,
          iconType as any
        );

        // Update project with generation info
        await this.storageService.updateProject(id, {
          generatedAt: new Date().toISOString(),
          outputPath: baseDir
        });

        return generationResult;
      } catch (error) {
        console.error('Failed to generate icons:', error);
        throw error;
      }
    });

    // File operations
    ipcMain.handle('files:selectSvg', async () => {
      try {
        const result = await dialog.showOpenDialog(this.window, {
          properties: ['openFile'],
          filters: [
            { name: 'SVG Files', extensions: ['svg'] }
          ]
        });

        return result.canceled ? null : result.filePaths[0];
      } catch (error) {
        console.error('Failed to select SVG file:', error);
        return null;
      }
    });

    ipcMain.handle('files:selectOutputFolder', async () => {
      try {
        const result = await dialog.showOpenDialog(this.window, {
          properties: ['openDirectory'],
          title: 'Select Output Folder'
        });

        return result.canceled ? null : result.filePaths[0];
      } catch (error) {
        console.error('Failed to select output folder:', error);
        return null;
      }
    });

    ipcMain.handle('files:downloadProject', async (_event, id: string, packageType: string) => {
      try {
        const project = await this.storageService.getProjectById(id);
        if (!project) return false;

        const path = require('path');
        const fs = require('fs');

        const baseDir = project.outputPath || path.join(app.getPath('userData'), 'svg2icon', 'projects', id);
        const pickDirs = (type: string): string[] => {
          switch (type) {
            case 'all': return ['universal-icons', 'ios-icons', 'android-icons', 'desktop-icons', 'web-icons'].map(p => path.join(baseDir, p));
            case 'mobile': return ['ios-icons', 'android-icons'].map(p => path.join(baseDir, p));
            case 'desktop': return ['desktop-icons'].map(p => path.join(baseDir, p));
            case 'web': return ['web-icons'].map(p => path.join(baseDir, p));
            case 'original': return [baseDir];
            default: return [];
          }
        };

        const chosen = await dialog.showOpenDialog(this.window, {
          properties: ['openDirectory', 'createDirectory'],
          title: 'Select download destination'
        });
        if (chosen.canceled || !chosen.filePaths.length) return false;
        const destRoot = chosen.filePaths[0];

        const targets = pickDirs(packageType);
        if (!targets.length) return false;

        const copyRecursive = (src: string, dest: string) => {
          if (!fs.existsSync(src)) return;
          const stat = fs.statSync(src);
          if (stat.isDirectory()) {
            fs.mkdirSync(dest, { recursive: true });
            for (const entry of fs.readdirSync(src)) {
              copyRecursive(path.join(src, entry), path.join(dest, entry));
            }
          } else {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(src, dest);
          }
        };

        const bundleName = `${project.name.replace(/[^a-z0-9\-]+/ig,'-')}-${packageType}`;
        const finalDest = path.join(destRoot, bundleName);
        fs.mkdirSync(finalDest, { recursive: true });

        if (packageType === 'original') {
          // Write original.svg
          const svgContent = Buffer.from(project.svgData, 'base64').toString('utf-8');
          fs.writeFileSync(path.join(finalDest, `${project.name}.svg`), svgContent);
        } else {
          for (const dir of targets) {
            if (fs.existsSync(dir)) {
              const baseName = path.basename(dir);
              copyRecursive(dir, path.join(finalDest, baseName));
            }
          }
        }
        return true;
      } catch (error) {
        console.error('Failed to download project:', error);
        return false;
      }
    });

    // Settings operations
    ipcMain.handle('settings:get', async () => {
      try {
        return await this.storageService.getSettings();
      } catch (error) {
        console.error('Failed to get settings:', error);
        return {};
      }
    });

    ipcMain.handle('settings:set', async (event, key: string, value: any) => {
      try {
        await this.storageService.setSetting(key, value);
      } catch (error) {
        console.error('Failed to set setting:', error);
        throw error;
      }
    });

    ipcMain.handle('settings:setTheme', async (event, theme: string) => {
      try {
        await this.storageService.setSetting('theme', theme);
      } catch (error) {
        console.error('Failed to set theme:', error);
        throw error;
      }
    });

    // Window operations
    ipcMain.handle('window:minimize', async () => {
      this.window.minimize();
    });

    ipcMain.handle('window:maximize', async () => {
      if (this.window.isMaximized()) {
        this.window.unmaximize();
      } else {
        this.window.maximize();
      }
    });

    ipcMain.handle('window:close', async () => {
      this.window.close();
    });

    // App operations
    ipcMain.handle('app:getVersion', async () => {
      return app.getVersion();
    });

    ipcMain.handle('app:checkForUpdates', async () => {
      // Implementation for checking updates
      return { hasUpdate: false, version: app.getVersion() };
    });
  }

  private setupMenu(): void {
    // Remove default menu on Windows/Linux
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null);
    }
  }

  // Note: renderer sends base64; no file conversion here in v1.1.0
  private async fileToBase64(_file: any): Promise<string> { return ''; }

  cleanup(): void {
    // Cleanup resources
    this.storageService.close();
  }
}
