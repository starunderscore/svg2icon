// Electron main process - SVG2Icon v1.1.0

import { BrowserWindow, ipcMain, dialog, app, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
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

        const baseDir = project.outputPath || path.join(app.getPath('userData'), 'svg2icon', 'projects', id);

        // Ensure output base exists
        fs.mkdirSync(baseDir, { recursive: true });

        // Helper to generate icons for required types
        const ensureGenerated = async (types: string[]) => {
          for (const t of types) {
            await this.iconGenerationService.generateIcons(
              project.svgData,
              baseDir,
              t as any
            );
          }
          // Update project metadata
          await this.storageService.updateProject(id, {
            generatedAt: new Date().toISOString(),
            outputPath: baseDir
          } as any);
        };

        const chosen = await dialog.showOpenDialog(this.window, {
          properties: ['openDirectory', 'createDirectory'],
          title: 'Select download destination'
        });
        if (chosen.canceled || !chosen.filePaths.length) return false;
        const destRoot = chosen.filePaths[0];

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

        // Build outer folder name: {projectname}_{selection}
        const selectionLabel = packageType === 'original' ? 'svg' : packageType;
        const baseName = `${project.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')}_${selectionLabel}`;
        // Ensure uniqueness by appending (n)
        let folderName = baseName;
        let candidatePath = path.join(destRoot, folderName);
        if (fs.existsSync(candidatePath)) {
          let i = 0;
          while (fs.existsSync(path.join(destRoot, `${baseName} (${i})`))) i++;
          folderName = `${baseName} (${i})`;
          candidatePath = path.join(destRoot, folderName);
        }
        const finalDest = candidatePath;
        fs.mkdirSync(finalDest, { recursive: true });

        const writeOriginalSvg = () => {
          const svgContent = Buffer.from(project.svgData, 'base64').toString('utf-8');
          const svgDir = path.join(finalDest, 'svg');
          fs.mkdirSync(svgDir, { recursive: true });
          fs.writeFileSync(path.join(svgDir, `${project.name}.svg`), svgContent);
        };

        switch (packageType) {
          case 'web': {
            await ensureGenerated(['web']);
            copyRecursive(path.join(baseDir, 'web-icons'), path.join(finalDest, 'web'));
            break;
          }
          case 'desktop': {
            await ensureGenerated(['desktop']);
            copyRecursive(path.join(baseDir, 'desktop-icons'), path.join(finalDest, 'desktop'));
            break;
          }
          case 'mobile': {
            await ensureGenerated(['ios', 'android']);
            const mobileDest = path.join(finalDest, 'mobile');
            copyRecursive(path.join(baseDir, 'ios-icons'), path.join(mobileDest, 'ios-icons'));
            copyRecursive(path.join(baseDir, 'android-icons'), path.join(mobileDest, 'android-icons'));
            break;
          }
          case 'original': {
            writeOriginalSvg();
            break;
          }
          case 'all':
          default: {
            await ensureGenerated(['web', 'desktop', 'ios', 'android']);
            copyRecursive(path.join(baseDir, 'web-icons'), path.join(finalDest, 'web'));
            copyRecursive(path.join(baseDir, 'desktop-icons'), path.join(finalDest, 'desktop'));
            const mobileDest = path.join(finalDest, 'mobile');
            copyRecursive(path.join(baseDir, 'ios-icons'), path.join(mobileDest, 'ios-icons'));
            copyRecursive(path.join(baseDir, 'android-icons'), path.join(mobileDest, 'android-icons'));
            writeOriginalSvg();
            break;
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
