// renderer.js - Main orchestrator
const TelemetryService = require('./services/TelemetryService');
const SettingsManager = require('./services/SettingsManager');
const UIManager = require('./ui/UIManager');
const FileManager = require('./services/FileManager');

class IconGeneratorApp {
    constructor() {
        this.telemetryService = new TelemetryService();
        this.settingsManager = new SettingsManager(this.telemetryService);
        this.uiManager = new UIManager(this.telemetryService);
        this.fileManager = new FileManager(this.telemetryService);
        
        this.initialize();
    }

    initialize() {
        this.settingsManager.initialize();
        this.uiManager.initialize();
        this.setupEventHandlers();
        this.initializeUI();
    }

    setupEventHandlers() {
        this.uiManager.elements.selectSvgBtn.addEventListener('click', 
            () => this.handleSvgSelection());
        
        this.uiManager.elements.selectOutputBtn.addEventListener('click', 
            () => this.handleOutputSelection());
        
        this.uiManager.elements.generateBtn.addEventListener('click', 
            () => this.handleGeneration());

        this.setupToggleHandlers();
        this.setupThemeHandlers();
        this.setupUpdateHandler();
    }

    setupToggleHandlers() {
        this.uiManager.elements.autoUpdateToggle.addEventListener('click', () => {
            const newValue = this.settingsManager.toggle('autoUpdate');
            this.uiManager.updateToggleState(this.uiManager.elements.autoUpdateToggle, newValue);
            try {
                if (process.platform === 'win32') {
                    const { ipcRenderer } = require('electron');
                    ipcRenderer.invoke('updater:setAutoDownload', !!newValue).catch(() => {});
                }
            } catch {}
        });

        this.uiManager.elements.telemetryToggle.addEventListener('click', () => {
            const newValue = this.settingsManager.toggle('telemetry');
            this.uiManager.updateToggleState(this.uiManager.elements.telemetryToggle, newValue);
        });
    }

    setupThemeHandlers() {
        this.uiManager.elements.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.settingsManager.set('theme', theme);
                this.uiManager.updateThemeUI(theme);
            });
        });
    }

    setupUpdateHandler() {
        this.uiManager.elements.checkUpdateBtn.addEventListener('click', () => {
            this.checkForUpdates();
        });

        // Listen for updater events (Windows auto-update flow)
        try {
            if (process.platform === 'win32') {
                const { ipcRenderer } = require('electron');
                ipcRenderer.on('updater:checking', () => {
                    this.uiManager.showUpdateStatus('Checking for updates...', 'checking');
                });
                ipcRenderer.on('updater:update-available', () => {
                    if (this.settingsManager.get('autoUpdate')) {
                        this.uiManager.showUpdateStatus('Update available. Downloading...', 'available');
                        ipcRenderer.invoke('updater:download');
                    } else {
                        // Manual vibe: open releases instead
                        this.uiManager.showUpdateStatus('Update available. Opening releases...', 'available');
                        ipcRenderer.invoke('open-releases');
                    }
                });
                ipcRenderer.on('updater:no-update', () => {
                    this.uiManager.showUpdateStatus('You are running the latest version!', 'up-to-date');
                });
                ipcRenderer.on('updater:progress', (_e, p) => {
                    const pct = p && typeof p.percent === 'number' ? Math.round(p.percent) : 0;
                    this.uiManager.showUpdateStatus(`Downloading update... ${pct}%`, 'available');
                });
                ipcRenderer.on('updater:ready', () => {
                    this.uiManager.showUpdateStatus('Update downloaded. Restarting...', 'available');
                    if (this.settingsManager.get('autoUpdate')) {
                        setTimeout(() => ipcRenderer.invoke('updater:install'), 800);
                    }
                });
                ipcRenderer.on('updater:error', (_e, msg) => {
                    this.uiManager.showUpdateStatus('Update error: ' + (msg || 'Unknown'), 'available');
                });
            }
        } catch {}
    }

    async handleSvgSelection() {
        const result = await this.fileManager.selectSvgFile();
        
        if (result.success) {
            this.uiManager.updateSvgPreview(result.filePath);
            this.updateGenerateButton();
        } else if (result.error) {
            this.uiManager.showStatus('Error selecting SVG file: ' + result.error, true);
        }
    }

    async handleOutputSelection() {
        const result = await this.fileManager.selectOutputFolder();
        
        if (result.success) {
            this.uiManager.updateOutputPath(result.folderPath);
            this.updateGenerateButton();
        } else if (result.error) {
            this.uiManager.showStatus('Error selecting output folder: ' + result.error, true);
        }
    }

    async handleGeneration() {
        if (!this.fileManager.canGenerate()) {
            this.uiManager.showStatus('Please select both SVG file and output folder', true);
            return;
        }

        this.uiManager.setGeneratingState(true);
        
        const iconType = this.uiManager.elements.iconType.value;
        const result = await this.fileManager.generateIcons(iconType);
        
        this.uiManager.setGeneratingState(false);
        this.updateGenerateButton();
        
        if (result.success) {
            this.uiManager.showStatus(result.message);
        } else {
            this.uiManager.showStatus(result.error || result.message, true);
        }
    }

    updateGenerateButton() {
        const canGenerate = this.fileManager.canGenerate();
        this.uiManager.updateGenerateButton(canGenerate);
    }

    initializeUI() {
        this.uiManager.updateToggleState(
            this.uiManager.elements.autoUpdateToggle, 
            this.settingsManager.get('autoUpdate')
        );
        
        this.uiManager.updateToggleState(
            this.uiManager.elements.telemetryToggle, 
            this.settingsManager.get('telemetry')
        );

        this.uiManager.updateThemeUI(this.settingsManager.get('theme'));
        
        this.updateGenerateButton();

        if (this.settingsManager.get('autoUpdate')) {
            if (process.platform === 'win32') {
                try {
                    const { ipcRenderer } = require('electron');
                    ipcRenderer.invoke('updater:setAutoDownload', true);
                } catch {}
            }
            setTimeout(() => this.checkForUpdates(), 1000);
        }
    }

    async checkForUpdates() {
        this.uiManager.showUpdateStatus('Checking for updates...', 'checking');
        this.telemetryService.track('update_check_started');
        // On Windows with auto-update enabled, use electron-updater; otherwise use GitHub notify flow
        const isWin = (typeof process !== 'undefined' && process.platform === 'win32');
        const auto = !!this.settingsManager.get('autoUpdate');
        if (isWin && auto) {
            try {
                const { ipcRenderer } = require('electron');
                await ipcRenderer.invoke('updater:check');
            } catch (e) {
                this.uiManager.showUpdateStatus('Update check failed. Opening releases...', 'available');
                try {
                    const { ipcRenderer } = require('electron');
                    await ipcRenderer.invoke('open-releases');
                } catch {}
            }
            return;
        }

        // Fallback/manual flow (Linux and Windows manual mode)
        try {
            const { ipcRenderer } = require('electron');
            const result = await ipcRenderer.invoke('check-for-updates');
            if (result && result.ok) {
                if (result.hasUpdate) {
                    this.uiManager.showUpdateStatus(`Update available: ${result.current} → ${result.latest}. Opening download...`, 'available');
                    this.telemetryService.track('update_check_completed', { result: 'available', current_version: result.current, latest_version: result.latest });
                    const url = result.assetUrl || result.pageUrl;
                    await ipcRenderer.invoke('open-url', url);
                } else {
                    this.uiManager.showUpdateStatus('You are running the latest version!', 'up-to-date');
                    this.telemetryService.track('update_check_completed', { result: 'up_to_date', current_version: result.current });
                }
            } else {
                this.uiManager.showUpdateStatus('Unable to check right now. Opening releases...', 'available');
                await ipcRenderer.invoke('open-releases');
            }
        } catch (e) {
            this.uiManager.showUpdateStatus('Unable to check right now. Opening releases...', 'available');
            try {
                const { ipcRenderer } = require('electron');
                await ipcRenderer.invoke('open-releases');
            } catch {}
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IconGeneratorApp();
});
