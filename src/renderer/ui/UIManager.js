// UIManager.js
class UIManager {
  constructor(telemetryService) {
      this.telemetryService = telemetryService;
      this.elements = this.initializeElements();
      this.setupEventListeners();
  }

  initializeElements() {
      return {
          // Main UI
          iconPreview: document.getElementById('iconPreview'),
          iconType: document.getElementById('iconType'),
          selectSvgBtn: document.getElementById('selectSvgBtn'),
          selectOutputBtn: document.getElementById('selectOutputBtn'),
          generateBtn: document.getElementById('generateBtn'),
          outputPath: document.getElementById('outputPath'),
          outputPathText: document.getElementById('outputPathText'),
          status: document.getElementById('status'),
          featureList: document.getElementById('featureList'),

          // Settings Modal
          settingsIcon: document.getElementById('settingsIcon'),
          settingsModal: document.getElementById('settingsModal'),
          closeModal: document.getElementById('closeModal'),
          
          // Toggles
          autoUpdateToggle: document.getElementById('autoUpdateToggle'),
          telemetryToggle: document.getElementById('telemetryToggle'),
          
          // Theme
          themeOptions: document.querySelectorAll('.theme-option'),
          
          // Updates
          checkUpdateBtn: document.getElementById('checkUpdateBtn'),
          updateStatus: document.getElementById('updateStatus')
      };
  }

  setupEventListeners() {
      // Settings modal
      this.elements.settingsIcon.addEventListener('click', () => this.openSettingsModal());
      this.elements.closeModal.addEventListener('click', () => this.closeSettingsModal());
      
      // Close modal when clicking outside
      this.elements.settingsModal.addEventListener('click', (e) => {
          if (e.target === this.elements.settingsModal) {
              this.closeSettingsModal();
          }
      });

      // Escape key to close modal
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.elements.settingsModal.classList.contains('active')) {
              this.closeSettingsModal();
          }
      });

      // Icon type changes
      this.elements.iconType.addEventListener('change', () => this.updateFeatureList());

      // App lifecycle
      window.addEventListener('beforeunload', () => this.handleAppClosing());
      window.addEventListener('focus', () => this.telemetryService.track('app_focused'));
      window.addEventListener('blur', () => this.telemetryService.track('app_unfocused'));
  }

  openSettingsModal() {
      this.elements.settingsModal.classList.add('active');
      this.telemetryService.track('settings_modal_opened');
  }

  closeSettingsModal() {
      this.elements.settingsModal.classList.remove('active');
      this.telemetryService.track('settings_modal_closed');
  }

  showStatus(message, isError = false) {
      this.elements.status.textContent = message;
      this.elements.status.className = `status ${isError ? 'error' : 'success'}`;
      this.elements.status.style.display = 'block';
      
      this.telemetryService.track('status_message_shown', {
          message_type: isError ? 'error' : 'success',
          message_preview: message.substring(0, 50)
      });
      
      setTimeout(() => {
          this.elements.status.style.display = 'none';
      }, 5000);
  }

  updateGenerateButton(canGenerate) {
      this.elements.generateBtn.disabled = !canGenerate;
      this.elements.generateBtn.style.opacity = canGenerate ? '1' : '0.5';
      
      if (canGenerate) {
          this.telemetryService.track('generate_button_enabled');
      }
  }

  updateSvgPreview(filePath) {
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop();
      
      this.elements.iconPreview.innerHTML = `
          <img src="file://${filePath}" alt="SVG Preview" style="max-width: 100%; max-height: 100%;" />
      `;
      this.elements.iconPreview.classList.add('has-file');
      
      this.elements.selectSvgBtn.textContent = `✓ ${fileName}`;
      this.elements.selectSvgBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
  }

  updateOutputPath(folderPath) {
      this.elements.outputPathText.textContent = folderPath;
      this.elements.outputPath.style.display = 'block';
      
      this.elements.selectOutputBtn.textContent = '✓ Output Folder Selected';
      this.elements.selectOutputBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
  }

  setGeneratingState(isGenerating) {
      if (isGenerating) {
          this.originalGenerateText = this.elements.generateBtn.textContent;
          this.elements.generateBtn.innerHTML = '<span class="loading"></span>Generating Icons...';
          this.elements.generateBtn.disabled = true;
      } else {
          this.elements.generateBtn.textContent = this.originalGenerateText || 'Generate Icons';
          this.elements.generateBtn.disabled = false;
      }
  }

  updateFeatureList() {
      const iconTypeFeatures = {
          universal: [
              'Complete cross-platform package',
              'Organized mobile/desktop/web folders',
              'iOS, Android, Desktop, Web icons',
              'Ready for any development workflow'
          ],
          ios: [
              'iOS App Store requirements',
              'All device sizes (@1x, @2x, @3x)',
              'iPhone and iPad support',
              'Retina display optimized'
          ],
          android: [
              'Google Play Store ready',
              'Multiple density folders',
              'Material Design compliant',
              'All Android device sizes'
          ],
          desktop: [
              'Complete desktop app package',
              'ICO and ICNS files included',
              'Windows, macOS, Linux ready',
              'All standard desktop sizes'
          ],
          electron: [
              'Electron-builder ready structure',
              'Auto ICO and ICNS generation',
              'Perfect assets/ folder layout',
              'Cross-platform Electron apps'
          ],
          web: [
              'PWA manifest ready',
              'Favicon sizes included',
              'Apple touch icons',
              'Web app install ready'
          ]
      };

      const selectedType = this.elements.iconType.value;
      const features = iconTypeFeatures[selectedType];
      
      this.elements.featureList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
      
      this.telemetryService.track('icon_type_selected', {
          icon_type: selectedType,
          features_count: features.length
      });
  }

  updateToggleState(toggleElement, isActive) {
      if (isActive) {
          toggleElement.classList.add('active');
      } else {
          toggleElement.classList.remove('active');
      }
  }

  updateThemeUI(selectedTheme) {
      this.elements.themeOptions.forEach(option => {
          option.classList.remove('active');
          if (option.dataset.theme === selectedTheme) {
              option.classList.add('active');
          }
      });
  }

  showUpdateStatus(message, type = 'checking') {
      this.elements.updateStatus.textContent = message;
      this.elements.updateStatus.className = `update-status ${type}`;
      this.elements.updateStatus.style.display = 'block';
  }

  handleAppClosing() {
      const sessionDuration = Date.now() - (window.sessionStartTime || Date.now());
      this.telemetryService.track('app_closing', {
          session_duration_ms: sessionDuration
      });
  }

  initialize() {
      this.updateFeatureList();
      window.sessionStartTime = Date.now();
      
      this.telemetryService.track('app_initialized', {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
  }
}

module.exports = UIManager;