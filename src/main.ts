import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
import { generateIconSet } from './icon-generator';

let mainWindow: BrowserWindow;

function resolveAppIcon(): string {
  const base = app.isPackaged
    ? path.join(process.resourcesPath, 'assets', 'this-app')
    : path.join(__dirname, '../src/assets/this-app');

  if (process.platform === 'win32') return path.join(base, 'icon.ico');
  if (process.platform === 'darwin') return path.join(base, 'icon.icns');
  // Linux and others prefer PNG
  return path.join(base, 'icon-512.png');
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    icon: resolveAppIcon(),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('select-svg-file', async (): Promise<string | null> => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'SVG Files', extensions: ['svg'] }
    ]
  });
  
  if (Array.isArray(result)) {
    return result.length > 0 ? result[0] : null;
  } else {
    const dialogResult = result as any;
    if (!dialogResult.canceled && dialogResult.filePaths && dialogResult.filePaths.length > 0) {
      return dialogResult.filePaths[0];
    }
    return null;
  }
});

ipcMain.handle('select-output-folder', async (): Promise<string | null> => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (Array.isArray(result)) {
    return result.length > 0 ? result[0] : null;
  } else {
    const dialogResult = result as any;
    if (!dialogResult.canceled && dialogResult.filePaths && dialogResult.filePaths.length > 0) {
      return dialogResult.filePaths[0];
    }
    return null;
  }
});

ipcMain.handle('generate-icons', async (event: IpcMainInvokeEvent, svgPath: string, outputPath: string, iconType: string): Promise<{ success: boolean; message: string }> => {
  try {
    await generateIconSet(svgPath, outputPath, iconType);
    return { success: true, message: 'Icons generated successfully!' };
  } catch (error) {
    console.error('Error generating icons:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, message: `Error: ${errorMessage}` };
  }
});
