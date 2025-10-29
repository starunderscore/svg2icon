// App entry (Electron) for v1.1.0
import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { ElectronMain } from './electron/main.js';

// Use a separate userData folder for dev runs so test data
// never mixes with production data.
const isDev = process.argv.includes('--dev');
if (isDev) {
  try {
    const defaultUserData = app.getPath('userData');
    const devUserData = `${defaultUserData}-dev`;
    app.setPath('userData', devUserData);
    try { app.setName(`${app.name} Dev`); } catch {}
  } catch {}
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let core: ElectronMain | null = null;

function createWindow() {
  // Read persisted theme synchronously to pick correct background and avoid flash
  let bgColor = '#0b0f0e'; // dark fallback
  try {
    // Manually read settings from storage file
    const fs = require('fs');
    const p = require('path');
    const userDataPath = app.getPath('userData');
    const jsonPath = p.join(userDataPath, 'svg2icon.json');
    if (fs.existsSync(jsonPath)) {
      const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) || {};
      const theme = (raw.settings && raw.settings.theme) || 'dark';
      bgColor = theme === 'light' ? '#faf9f7' : '#0b0f0e';
    }
  } catch {}

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
  // Pass initial theme as a query param so the page can apply it pre-CSS
  const initialTheme = bgColor === '#faf9f7' ? 'light' : 'dark';
  mainWindow.loadFile(indexPath, { search: `?theme=${initialTheme}` });

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
