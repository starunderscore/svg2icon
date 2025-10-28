// Preload: expose a safe electronAPI for renderer (CommonJS for Electron preload)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  projects: {
    getAll: () => ipcRenderer.invoke('projects:getAll'),
    create: (data: any) => ipcRenderer.invoke('projects:create', data),
    update: (id: string, data: any) => ipcRenderer.invoke('projects:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
    generateIcons: (id: string, type: string) => ipcRenderer.invoke('projects:generateIcons', id, type),
  },
  files: {
    selectSvg: () => ipcRenderer.invoke('files:selectSvg'),
    selectOutputFolder: () => ipcRenderer.invoke('files:selectOutputFolder'),
    downloadProject: (id: string, type: string) => ipcRenderer.invoke('files:downloadProject', id, type),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
    setTheme: (theme: string) => ipcRenderer.invoke('settings:setTheme', theme),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),
    openExternal: (url: string) => ipcRenderer.invoke('app:openExternal', url),
  },
  // Menu event subscriptions (whitelisted)
  menu: {
    onNewProject: (cb: () => void) => ipcRenderer.on('menu:new-project', () => cb()),
    onOpenSettings: (cb: () => void) => ipcRenderer.on('menu:open-settings', () => cb()),
    onCheckUpdates: (cb: () => void) => ipcRenderer.on('menu:check-updates', () => cb()),
    onUserManual: (cb: () => void) => ipcRenderer.on('menu:user-manual', () => cb()),
    onTechGuide: (cb: () => void) => ipcRenderer.on('menu:tech-guide', () => cb()),
    onAbout: (cb: () => void) => ipcRenderer.on('menu:about', () => cb()),
  },
});
