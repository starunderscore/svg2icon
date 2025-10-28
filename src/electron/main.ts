// Electron main process - SVG2Icon v1.1.0

import { BrowserWindow, ipcMain, dialog, app, Menu, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { StorageService } from './storage.js';
import { IconGenerationService } from '../services/IconGenerationService.js';
import type { Project, CreateProjectData, UpdateProjectData } from '../types/Project.js';
import { spawnSync } from 'child_process';

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
        const result = await this.withForeground(() => dialog.showOpenDialog(this.window, {
          properties: ['openFile'],
          filters: [
            { name: 'SVG Files', extensions: ['svg'] }
          ]
        }));
        return result.canceled ? null : result.filePaths[0];
      } catch (error) {
        console.error('Failed to select SVG file:', error);
        return null;
      }
    });

    ipcMain.handle('files:selectOutputFolder', async () => {
      try {
        const result = await dialog.showSaveDialog(this.window, {
          title: 'Save ZIP',
          defaultPath: path.join(app.getPath('downloads'), 'icons.zip'),
          filters: [{ name: 'ZIP archive', extensions: ['zip'] }]
        });
        return result.canceled ? null : result.filePath;
      } catch (error) {
        console.error('Failed to select save location:', error);
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

        // Build outer folder and zip name: <project name> - <download selection> - svg2icon
        const selectionLabelMap: Record<string, string> = {
          web: 'Web',
          desktop: 'Desktop',
          mobile: 'Mobile',
          all: 'All',
          original: 'SVG'
        };
        const selectionLabelRaw = selectionLabelMap[packageType] || 'All';
        const displayBaseName = `${project.name} - ${selectionLabelRaw} - svg2icon`;
        const safeBaseName = displayBaseName.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
        // Pre-decide default filename with (n) suffix in Downloads
        const downloadsDir = app.getPath('downloads');
        let defaultZipName = `${safeBaseName}.zip`;
        if (fs.existsSync(path.join(downloadsDir, defaultZipName))) {
          let i = 1;
          while (fs.existsSync(path.join(downloadsDir, `${safeBaseName} (${i}).zip`))) i++;
          defaultZipName = `${safeBaseName} (${i}).zip`;
        }
        // Bring window to front to ensure dialog is foregrounded
        const saveResult = await this.withForeground(() => dialog.showSaveDialog(this.window, {
          title: 'Save ZIP',
          defaultPath: path.join(app.getPath('downloads'), defaultZipName),
          filters: [{ name: 'ZIP archive', extensions: ['zip'] }]
        }));
        if (saveResult.canceled || !saveResult.filePath) return false;
        const zipPath = saveResult.filePath.endsWith('.zip') ? saveResult.filePath : `${saveResult.filePath}.zip`;
        // Use a staging folder to assemble contents
        const finalDest = path.join(app.getPath('temp'), `${safeBaseName}.staging`);
        fs.mkdirSync(finalDest, { recursive: true });
        fs.mkdirSync(finalDest, { recursive: true });

        const writeOriginalSvg = () => {
          const svgContent = Buffer.from(project.svgData, 'base64').toString('utf-8');
          const svgDir = path.join(finalDest, 'svg');
          fs.mkdirSync(svgDir, { recursive: true });
          // Sanitize similar to outer folder naming
          const baseSafe = project.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
          const fileName = `${baseSafe}_original.svg`;
          fs.writeFileSync(path.join(svgDir, fileName), svgContent);
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
        // Zip the staging folder
        const zipOk = (() => {
          const hasCmd = (cmd: string, args: string[] = ['-v']) => {
            try { return spawnSync(cmd, args, { stdio: 'ignore' }).status === 0; } catch { return false; }
          };
          try {
            if (process.platform === 'win32') {
              // Use PowerShell Compress-Archive
              if (hasCmd('powershell', ['-NoProfile','-Command','$PSVersionTable.PSVersion'])) {
                const script = `Compress-Archive -Path "${finalDest}/*" -DestinationPath "${zipPath}" -Force`;
                spawnSync('powershell', ['-NoProfile', '-Command', script], { stdio: 'ignore' });
                if (fs.existsSync(zipPath)) return true;
              }
            }
            if (hasCmd('zip')) {
              spawnSync('zip', ['-r', zipPath, '.'], { cwd: finalDest, stdio: 'ignore' });
              if (fs.existsSync(zipPath)) return true;
            }
            if (hasCmd('7z')) {
              spawnSync('7z', ['a', zipPath, '.'], { cwd: finalDest, stdio: 'ignore' });
              if (fs.existsSync(zipPath)) return true;
            }
            // Fallback: Python zipfile module (common on Linux/macOS)
            if (hasCmd('python3', ['-c', 'import sys'])) {
              spawnSync('python3', ['-m', 'zipfile', '-c', zipPath, '.'], { cwd: finalDest, stdio: 'ignore' });
              if (fs.existsSync(zipPath)) return true;
            }
            if (hasCmd('python', ['-c', 'import sys'])) {
              spawnSync('python', ['-m', 'zipfile', '-c', zipPath, '.'], { cwd: finalDest, stdio: 'ignore' });
              if (fs.existsSync(zipPath)) return true;
            }
          } catch {}
          return false;
        })();

        // Cleanup staging folder and return
        try { fs.rmSync(finalDest, { recursive: true, force: true }); } catch {}
        return zipOk;
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

    ipcMain.handle('settings:setTheme', async (_event, _theme: string) => {
      try {
        // Enforce dark theme only
        await this.storageService.setSetting('theme', 'dark');
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

    ipcMain.handle('app:openExternal', async (_event, url: string) => {
      try {
        await shell.openExternal(url);
        return true;
      } catch (error) {
        console.error('Failed to open external URL:', url, error);
        return false;
      }
    });

    // Removed app:getPackageVersion; updater modal only shows app version
  }

  private setupMenu(): void {
    const isMac = process.platform === 'darwin';
    const template: any[] = [];
    if (isMac) {
      template.push({
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideOthers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      });
    }
    template.push({
      label: 'File',
      submenu: [
        { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: () => { try { this.window.webContents.send('menu:new-project'); } catch {} } },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => { try { this.window.webContents.send('menu:open-settings'); } catch {} } },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit', accelerator: 'CmdOrCtrl+Q' }
      ]
    });
    // Tools menu: holds updater for now; About remains in Help
    template.push({
      label: 'Tools',
      submenu: [
        { label: 'Check for Updates', accelerator: 'CmdOrCtrl+Shift+U', click: () => { try { this.window.webContents.send('menu:check-updates'); } catch {} } },
      ]
    });
    template.push({
      label: 'Help',
      submenu: [
        { label: 'User Manual', accelerator: 'F1', click: () => { try { this.window.webContents.send('menu:user-manual'); } catch {} } },
        { label: 'Tech Guide', accelerator: 'Shift+F1', click: () => { try { this.window.webContents.send('menu:tech-guide'); } catch {} } },
        { type: 'separator' },
        { label: 'Report Issue', accelerator: 'CmdOrCtrl+Alt+R', click: async () => { try { await shell.openExternal('https://github.com/starunderscore/svg2icon/issues'); } catch {} } },
        { type: 'separator' },
        { label: 'About', accelerator: 'CmdOrCtrl+I', click: () => { try { this.window.webContents.send('menu:about'); } catch {} } }
      ]
    });
    const menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
  }

  // Note: renderer sends base64; no file conversion here in v1.1.0
  private async fileToBase64(_file: any): Promise<string> { return ''; }

  cleanup(): void {
    // Cleanup resources
    this.storageService.close();
  }

  // Ensure dialogs appear in the foreground across platforms
  private async withForeground<T>(fn: () => Promise<T>): Promise<T> {
    // Nudge the window to the foreground
    try { this.window.show(); this.window.focus(); } catch {}
    // On some Linux WMs, a short always-on-top pulse ensures the native dialog appears above
    let restoreTimer: NodeJS.Timeout | null = null;
    const prevAOT = this.window.isAlwaysOnTop();
    try {
      if (process.platform === 'linux') {
        this.window.setAlwaysOnTop(true, 'pop-up-menu');
        restoreTimer = setTimeout(() => {
          try { this.window.setAlwaysOnTop(prevAOT); } catch {}
        }, 400);
      }
      const result = await fn();
      return result;
    } finally {
      if (restoreTimer) {
        // If timer hasn't fired yet, clear and restore now
        clearTimeout(restoreTimer);
        try { this.window.setAlwaysOnTop(prevAOT); } catch {}
      }
    }
  }
}
