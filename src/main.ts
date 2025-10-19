import { app, BrowserWindow, ipcMain, dialog, IpcMainInvokeEvent, shell, Menu } from 'electron';
import * as path from 'path';
import * as https from 'https';
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
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Remove the default application menu/toolbar
  try {
    Menu.setApplicationMenu(null);
    mainWindow.setMenuBarVisibility(false);
  } catch {}

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

// Simple update-check wiring for GitHub Releases
function compareVersions(a: string, b: string): number {
  const norm = (v: string) => v.replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
  const aa = norm(a);
  const bb = norm(b);
  const len = Math.max(aa.length, bb.length);
  for (let i = 0; i < len; i++) {
    const x = aa[i] || 0;
    const y = bb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

async function fetchJson<T = any>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'SVG2Icon-Updater',
        'Accept': 'application/vnd.github+json'
      }
    }, res => {
      if (!res || (res.statusCode && res.statusCode >= 400)) {
        reject(new Error(`HTTP ${res?.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

type GithubAsset = { name: string; browser_download_url: string };
type GithubRelease = { tag_name?: string; name?: string; html_url?: string; assets?: GithubAsset[] };

ipcMain.handle('check-for-updates', async () => {
  const owner = 'starunderscore';
  const repo = 'svg2icon';
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
  const pageUrl = `https://github.com/${owner}/${repo}/releases/latest`;
  const current = app.getVersion();
  try {
    const latest: GithubRelease = await fetchJson<GithubRelease>(apiUrl);
    const latestTag = (latest.tag_name || latest.name || '').trim();
    const latestVersion = latestTag || '';
    const hasUpdate = latestVersion && compareVersions(latestVersion, current) > 0;

    // Try to pick a direct asset URL by platform (optional convenience)
    let assetUrl: string | null = null;
    const assets = latest.assets || [];
    const plat = process.platform;
    const arch = process.arch;
    if (assets.length) {
      if (plat === 'win32') {
        // Prefer x64 NSIS exe
        const patt = arch === 'ia32' ? /win-ia32\.exe$/i : /win-x64\.exe$/i;
        const a = assets.find(a => patt.test(a.name));
        if (a) assetUrl = a.browser_download_url;
      } else if (plat === 'linux') {
        // Prefer AppImage per arch
        const patt = arch === 'arm64' ? /linux-arm64\.AppImage$/i : /linux-x86_64\.AppImage$/i;
        const a = assets.find(a => patt.test(a.name));
        if (a) assetUrl = a.browser_download_url;
      } else if (plat === 'darwin') {
        // Future: dmg
        const a = assets.find(a => /\.dmg$/i.test(a.name));
        if (a) assetUrl = a.browser_download_url;
      }
    }

    return {
      ok: true,
      current,
      latest: latestVersion || null,
      hasUpdate,
      pageUrl,
      assetUrl
    };
  } catch (e) {
    console.warn('Update check failed:', e);
    return { ok: false, current, latest: null, hasUpdate: false, pageUrl };
  }
});

ipcMain.handle('open-url', async (_e: IpcMainInvokeEvent, url: string) => {
  if (typeof url === 'string' && url.startsWith('http')) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('open-releases', async () => {
  const url = 'https://github.com/starunderscore/svg2icon/releases/latest';
  await shell.openExternal(url);
  return true;
});
