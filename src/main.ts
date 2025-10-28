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
  // Enforce dark theme background to avoid flash
  const bgColor = '#0b0f0e';

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 560,
    center: true,
    autoHideMenuBar: false,
    show: false, // prevent flash; show when ready
    backgroundColor: bgColor,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'electron', 'preload.js'),
    },
  });

  // Use native application menu (configured in ElectronMain)

  // Initialize core IPC handlers
  core = new ElectronMain(mainWindow);

  const indexPath = path.join(__dirname, '../src/renderer/index.html');
  // Pass enforced dark theme as a query param
  mainWindow.loadFile(indexPath, { search: `?theme=dark` });

  // Show only when ready to minimize theme flash
  mainWindow.once('ready-to-show', () => {
    try { mainWindow?.show(); } catch {}
  });

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
