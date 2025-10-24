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
            <div class="privacy-card">
              <div class="privacy-header">
                <div class="privacy-left">
                  <svg class="privacy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V6l7-4z"/>
                  </svg>
                  <div class="privacy-title">
                    <h4 class="settings-item-title" style="margin:0;">Anonymous Usage Analytics</h4>
                    <span id="telemetry-status" class="privacy-status">Disabled</span>
                  </div>
                </div>
                <div class="settings-toggle" id="telemetry-toggle">
                  <div class="settings-toggle-handle"></div>
                </div>
              </div>
              <p class="settings-item-description">
                Help improve SVG2Icon with anonymous usage stats. We only capture high‑level feature usage, performance, and error signals.
              </p>
              <div class="privacy-grid">
                <div class="privacy-list">
                  <div class="privacy-list-title">We collect</div>
                  <ul>
                    <li>Feature usage</li>
                    <li>Icon generation counts</li>
                    <li>Error reports</li>
                  </ul>
                </div>
                <div class="privacy-list">
                  <div class="privacy-list-title">We don’t collect</div>
                  <ul>
                    <li>SVG files or project names</li>
                    <li>Local file paths</li>
                    <li>Personal data</li>
                  </ul>
                </div>
              </div>
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

    telemetryToggle?.addEventListener('click', () => {
      this.handleToggle('telemetry');
    });


    // Default icon type section removed

    // No Updates/About items here anymore (moved to dedicated modals)
  }

  private updateUI(): void {
    // Update theme selection
    const currentTheme = this.settings.theme || 'dark';
    document.querySelectorAll('.theme-option').forEach(option => {
      option.classList.toggle('is-active', (option as HTMLElement).dataset.theme === currentTheme);
    });

    // Update toggles
    this.updateToggle('telemetry-toggle', this.settings.telemetry !== false);
    // Update privacy status pill
    const status = document.getElementById('telemetry-status');
    if (status) {
      const enabled = this.settings.telemetry !== false;
      status.textContent = enabled ? 'Enabled' : 'Disabled';
      status.classList.toggle('is-active', enabled);
    }

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

  // (Deprecated handlers removed: check updates, external links, licenses)
}
