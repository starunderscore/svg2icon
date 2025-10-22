// SettingsModal - Application settings modal

import { Modal } from '../common/Modal.js';
import type { SettingsService } from '../../services/SettingsService.js';
import type { EventManager } from '../../utils/events.js';

interface SettingsModalProps {
  settingsService: SettingsService;
  eventManager: EventManager;
}

export class SettingsModal extends Modal {
  private props: SettingsModalProps;
  private settings: any = {};

  constructor(props: SettingsModalProps) {
    super({
      title: 'Settings',
      size: 'medium',
      className: 'settings-modal'
    });
    this.props = props;
  }

  protected override getContent(): string {
    return `
      <div class="settings-content">
        <!-- Theme Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">
            <svg class="settings-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"/>
            </svg>
            Appearance
          </h3>
          
          <div class="settings-item">
            <div class="settings-item-info">
              <h4 class="settings-item-title">Theme</h4>
              <p class="settings-item-description">Choose your preferred color scheme</p>
            </div>
            <div class="theme-selector">
              <div class="theme-option" data-theme="light">
                <div class="theme-preview light"></div>
                <span class="theme-option-label">Light</span>
              </div>
              <div class="theme-option" data-theme="system">
                <div class="theme-preview system"></div>
                <span class="theme-option-label">System</span>
              </div>
              <div class="theme-option" data-theme="dark">
                <div class="theme-preview dark"></div>
                <span class="theme-option-label">Dark</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Privacy Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">
            <svg class="settings-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Privacy & Analytics
          </h3>
          
          <div class="settings-item">
            <div class="privacy-info">
              <div class="privacy-text">
                <h4 class="settings-item-title">Anonymous Usage Analytics</h4>
                <p class="settings-item-description">
                  Help improve SVG2Icon by sharing anonymous usage statistics. This includes feature usage, error reports, and performance metrics.
                </p>
                <p><strong>What we collect:</strong> Feature usage, icon generation counts, error reports</p>
                <p><strong>What we don't collect:</strong> Your SVG files, project names, file paths, or personal data</p>
              </div>
              <div class="settings-toggle" id="telemetry-toggle">
                <div class="settings-toggle-handle"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Updates Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">
            <svg class="settings-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Updates
          </h3>
          
          <div class="settings-item">
            <div class="settings-item-info">
              <h4 class="settings-item-title">Automatic Updates</h4>
              <p class="settings-item-description">
                Automatically download and install updates when available
              </p>
            </div>
            <div class="settings-toggle" id="auto-update-toggle">
              <div class="settings-toggle-handle"></div>
            </div>
          </div>
          
          <div class="update-actions">
            <div class="current-version" id="current-version"></div>
            <button class="button" type="button" id="check-updates-btn">
              Check for Updates
            </button>
            <div class="update-status" id="update-status"></div>
          </div>
        </div>

        

        <!-- About Section -->
        <div class="settings-section">
          <h3 class="settings-section-title">
            <svg class="settings-section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            About
          </h3>
          
          <div class="about-info">
            <div class="app-info">
              <h4>SVG2Icon</h4>
            </div>
            
            <div class="links">
              <button class="button is-text" type="button" id="open-website">
                Visit Website
              </button>
              <button class="button is-text" type="button" id="report-issue">
                Report Issue
              </button>
            </div>
            
            <div class="brand-section" style="margin-top: 1.25rem; display: flex; align-items: center; gap: 0.75rem; justify-content: center;">
              <img src="../assets/star-underscore/favicon-32x32.png" alt="StarUnderscore" width="20" height="20" />
              <span style="color: var(--text-secondary);">Proudly made by <a href="#" id="open-website" style="color: var(--accent-primary); text-decoration: none;">StarUnderscore.com</a></span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  protected override getFooterActions(): string {
    return `
      <button class="button" type="button" data-action="close">Close</button>
    `;
  }

  protected override async onOpen(): Promise<void> {
    await this.loadSettings();
    this.bindEvents();
    this.updateUI();
    // Populate current version above update button
    try {
      const ver = await window.electronAPI.app.getVersion();
      const verEl = document.getElementById('current-version');
      if (verEl) verEl.textContent = `Version ${ver}`;
    } catch (e) {
      const verEl = document.getElementById('current-version');
      if (verEl) verEl.textContent = '';
    }
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'close') {
      return true; // Close modal
    }
    return false;
  }

  private async loadSettings(): Promise<void> {
    try {
      this.settings = await this.props.settingsService.getAll();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = {};
    }
  }

  private bindEvents(): void {
    // Theme selection
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = (option as HTMLElement).dataset.theme;
        if (theme) {
          this.handleThemeChange(theme);
        }
      });
    });

    // Toggle switches
    const telemetryToggle = document.getElementById('telemetry-toggle');
    const autoUpdateToggle = document.getElementById('auto-update-toggle');

    telemetryToggle?.addEventListener('click', () => {
      this.handleToggle('telemetry');
    });

    autoUpdateToggle?.addEventListener('click', () => {
      this.handleToggle('autoUpdate');
    });

    // Default icon type section removed

    // Update check
    const checkUpdatesBtn = document.getElementById('check-updates-btn');
    checkUpdatesBtn?.addEventListener('click', () => {
      this.handleCheckUpdates();
    });

    // External links
    document.getElementById('open-website')?.addEventListener('click', () => {
      this.openExternalLink('https://www.starunderscore.com/products/maverick-spirit/svg2icon');
    });

    document.getElementById('report-issue')?.addEventListener('click', () => {
      this.openExternalLink('https://github.com/starunderscore/svg2icon/issues');
    });
  }

  private updateUI(): void {
    // Update theme selection
    const currentTheme = this.settings.theme || 'dark';
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.toggle('is-active', (option as HTMLElement).dataset.theme === currentTheme);
    });

    // Update toggles
    this.updateToggle('telemetry-toggle', this.settings.telemetry !== false);
    this.updateToggle('auto-update-toggle', this.settings.autoUpdate === true);

    // Default icon type section removed
  }

  private updateToggle(toggleId: string, isActive: boolean): void {
    const toggle = document.getElementById(toggleId);
    if (toggle) {
      toggle.classList.toggle('is-checked', isActive);
    }
  }

  private async handleThemeChange(theme: string): Promise<void> {
    try {
      await this.props.settingsService.setTheme(theme as any);
      this.settings.theme = theme;
      this.updateUI();
      this.props.eventManager.emit('settings:theme_changed', theme);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  }

  private async handleToggle(setting: string): Promise<void> {
    try {
      const currentValue = this.settings[setting];
      const newValue = !currentValue;
      
      await this.props.settingsService.set(setting as any, newValue);
      this.settings[setting] = newValue;
      this.updateUI();
    } catch (error) {
      console.error(`Failed to toggle ${setting}:`, error);
    }
  }

  private async handleSettingChange(setting: string, value: any): Promise<void> {
    try {
      await this.props.settingsService.set(setting as any, value);
      this.settings[setting] = value;
    } catch (error) {
      console.error(`Failed to change ${setting}:`, error);
    }
  }

  private async handleCheckUpdates(): Promise<void> {
    const statusElement = document.getElementById('update-status');
    const button = document.getElementById('check-updates-btn') as HTMLButtonElement;

    if (button && statusElement) {
      button.classList.add('is-loading');
      button.disabled = true;
      statusElement.textContent = 'Checking for updates...';

      try {
        const result = await window.electronAPI.app.checkForUpdates();
        if (result.hasUpdate) {
          statusElement.textContent = `Update available: ${result.version}`;
        } else {
          statusElement.textContent = 'You are running the latest version';
        }
      } catch (error) {
        statusElement.textContent = 'Unable to check for updates';
      } finally {
        button.classList.remove('is-loading');
        button.disabled = false;
      }
    }
  }

  private openExternalLink(url: string): void {
    // Implementation would depend on your Electron setup
    console.log('Opening external link:', url);
  }

  private showLicenses(): void {
    // Implementation for showing license information
    console.log('Showing licenses');
  }
}
