// SettingsManager.js
class SettingsManager {
  constructor(telemetryService) {
      this.telemetryService = telemetryService;
      this.settings = {
          theme: 'system',
          autoUpdate: false,
          telemetry: true
      };
      this.storageKey = 'iconGeneratorSettings';
  }

  load() {
      const savedSettings = localStorage.getItem(this.storageKey);
      if (savedSettings) {
          try {
              this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
          } catch (error) {
              console.error('Error loading settings:', error);
          }
      }
      return this.settings;
  }

  save() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  get(key) {
      return this.settings[key];
  }

  set(key, value) {
      const previousValue = this.settings[key];
      this.settings[key] = value;
      
      this.handleSpecialSettings(key, value, previousValue);
      
      this.telemetryService.track('setting_changed', {
          setting_name: key,
          new_value: value,
          previous_value: previousValue
      });
      
      this.save();
  }

  handleSpecialSettings(key, value, previousValue) {
      switch (key) {
          case 'telemetry':
              if (value) {
                  this.telemetryService.enable();
              } else {
                  this.telemetryService.disable();
              }
              break;
          case 'theme':
              this.applyTheme(value);
              break;
      }
  }

  applyTheme(theme) {
      const body = document.body;
      
      body.classList.remove('dark-theme', 'light-theme');
      
      let appliedTheme = theme;
      if (theme === 'dark') {
          body.classList.add('dark-theme');
      } else if (theme === 'light') {
          body.classList.add('light-theme');
      } else if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
              body.classList.add('dark-theme');
              appliedTheme = 'dark';
          } else {
              body.classList.add('light-theme');
              appliedTheme = 'light';
          }
      }
      
      this.telemetryService.track('theme_applied', {
          requested_theme: theme,
          applied_theme: appliedTheme
      });
  }

  toggle(key) {
      const currentValue = this.get(key);
      this.set(key, !currentValue);
      return !currentValue;
  }

  initialize() {
      this.load();
      
      this.applyTheme(this.settings.theme);
      
      if (this.settings.telemetry) {
          this.telemetryService.initialize(true);
      }
      
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (this.settings.theme === 'system') {
              this.applyTheme('system');
              this.telemetryService.track('system_theme_changed', {
                  now_dark_mode: e.matches
              });
          }
      });
  }
}

module.exports = SettingsManager;