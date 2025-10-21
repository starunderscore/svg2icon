// FileManager.js
const { ipcRenderer } = require('electron');

class FileManager {
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
        this.selectedSvgPath = null;
        this.selectedOutputPath = null;
    }

    async selectSvgFile() {
        try {
            const filePath = await ipcRenderer.invoke('select-svg-file');
            if (filePath) {
                this.selectedSvgPath = filePath;
                
                const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
                
                this.telemetryService.track('svg_file_selected', {
                    file_name: fileName,
                    file_extension: fileName.split('.').pop(),
                    path_length: filePath.length
                });
                
                return { success: true, filePath, fileName };
            }
            return { success: false };
            
        } catch (error) {
            this.telemetryService.track('svg_selection_error', {
                error_message: error.message
            });
            
            return { success: false, error: error.message };
        }
    }

    async selectOutputFolder() {
        try {
            const folderPath = await ipcRenderer.invoke('select-output-folder');
            if (folderPath) {
                this.selectedOutputPath = folderPath;
                
                this.telemetryService.track('output_folder_selected', {
                    path_length: folderPath.length
                });
                
                return { success: true, folderPath };
            }
            return { success: false };
            
        } catch (error) {
            this.telemetryService.track('output_folder_selection_error', {
                error_message: error.message
            });
            
            return { success: false, error: error.message };
        }
    }

    async generateIcons(iconType) {
        if (!this.selectedSvgPath || !this.selectedOutputPath) {
            return { 
                success: false, 
                error: 'Please select both SVG file and output folder' 
            };
        }

        try {
            const startTime = Date.now();
            const svgFileName = this.selectedSvgPath.split('/').pop() || this.selectedSvgPath.split('\\').pop();
            
            this.telemetryService.track('icon_generation_started', {
                icon_type: iconType,
                svg_filename: svgFileName,
                output_path_length: this.selectedOutputPath.length
            });
            
            const result = await ipcRenderer.invoke('generate-icons', 
                this.selectedSvgPath, 
                this.selectedOutputPath, 
                iconType
            );
            
            const duration = Date.now() - startTime;
            
            this.telemetryService.track('icon_generation_completed', {
                icon_type: iconType,
                success: result.success,
                duration_ms: duration,
                svg_filename: svgFileName,
                error_message: result.success ? null : result.message
            });
            
            if (result.success) {
                this.telemetryService.track('icons_successfully_generated', {
                    icon_type: iconType,
                    generation_time: duration
                });
            }
            
            return result;
            
        } catch (error) {
            this.telemetryService.track('icon_generation_error', {
                error_message: error.message,
                icon_type: iconType,
                svg_path: this.selectedSvgPath
            });
            
            return { success: false, error: error.message };
        }
    }

    canGenerate() {
        return !!(this.selectedSvgPath && this.selectedOutputPath);
    }

    getSvgPath() {
        return this.selectedSvgPath;
    }

    getOutputPath() {
        return this.selectedOutputPath;
    }

    reset() {
        this.selectedSvgPath = null;
        this.selectedOutputPath = null;
    }
}

module.exports = FileManager;