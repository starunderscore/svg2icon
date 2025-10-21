// App entry (Electron) for v1.1.0
import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElectronMain } from './electron/main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let core: ElectronMain | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 560,
    center: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'electron', 'preload.js'),
    },
  });

  try {
    if (process.platform !== 'darwin') {
      Menu.setApplicationMenu(null);
      mainWindow.setMenuBarVisibility(false);
    }
  } catch {}

  // Initialize core IPC handlers
  core = new ElectronMain(mainWindow);

  const indexPath = path.join(__dirname, '../src/renderer/index.html');
  mainWindow.loadFile(indexPath);

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  mainWindow.on('closed', () => {
    core?.cleanup();
    core = null;
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
