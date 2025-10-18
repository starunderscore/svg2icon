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
            setTimeout(() => this.checkForUpdates(), 1000);
        }
    }

    checkForUpdates() {
        this.uiManager.showUpdateStatus('Checking for updates...', 'checking');
        this.telemetryService.track('update_check_started');
        
        setTimeout(() => {
            this.uiManager.showUpdateStatus('You are running the latest version!', 'up-to-date');
            this.telemetryService.track('update_check_completed', {
                result: 'up_to_date',
                current_version: '1.0.0'
            });
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IconGeneratorApp();
});