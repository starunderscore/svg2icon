// SettingsService - Application settings management

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  telemetry: boolean;
  autoUpdate: boolean;
  defaultIconType: string;
  lastUsedOutputPath?: string;
}

export class SettingsService {
  private settings: AppSettings;
  private initialized = false;

  constructor() {
    this.settings = this.getDefaultSettings();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const savedSettings = await window.electronAPI.settings.get();
      this.settings = { ...this.settings, ...savedSettings };
      // Keep localStorage in sync for ultra-early theme application in index.html
      try { localStorage.setItem('svg2icon_theme', this.settings.theme || 'dark'); } catch {}
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = this.getDefaultSettings();
      try { localStorage.setItem('svg2icon_theme', this.settings.theme); } catch {}
      this.initialized = true;
    }
  }

  async getAll(): Promise<AppSettings> {
    if (!this.initialized) {
      await this.initialize();
    }
    return { ...this.settings };
  }

  async get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.settings[key];
  }

  async set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    try {
      this.settings[key] = value;
      await window.electronAPI.settings.set(key, value);
      
      // Handle special settings
      if (key === 'theme') {
        this.applyTheme(value as string);
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      throw new Error('Failed to save setting');
    }
  }

  async setTheme(_theme: 'light' | 'dark' | 'system'): Promise<void> {
    // Force dark theme regardless of input
    const theme: 'dark' = 'dark';
    await this.set('theme', theme);
    await window.electronAPI.settings.setTheme(theme);
    // Sync localStorage for next startup
    try { localStorage.setItem('svg2icon_theme', theme); } catch {}
  }

  async toggleTheme(): Promise<string> {
    // Dark mode is enforced
    await this.setTheme('dark');
    return 'dark';
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'dark',
      telemetry: true,
      autoUpdate: false,
      defaultIconType: 'universal'
    };
  }

  private applyTheme(theme: string): void {
    const resolvedTheme = this.resolveTheme(theme as any);
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    
    // Emit theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: resolvedTheme }
    }));
  }

  private resolveTheme(_theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
    // Always resolve to dark
    return 'dark';
  }

  getAppliedTheme(): 'light' | 'dark' {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? 'dark' : 'light';
  }

  // Listen for system theme changes
  setupSystemThemeListener(): void {
    // No-op since dark theme is enforced
  }
}
