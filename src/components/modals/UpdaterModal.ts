// UpdaterModal - Dedicated updates dialog mirroring Settings style

import { Modal } from '../common/Modal.js';

export class UpdaterModal extends Modal {
  private settings: any = {};

  constructor() {
    super({ title: 'Updates', size: 'medium', className: 'updater-modal' });
  }

  protected override getContent(): string {
    return `
      <div class="updater-content" style="display:flex;flex-direction:column;gap:1rem;">
        <div class="settings-section">

          <div class="settings-item">
            <div class="settings-item-info">
              <h4 class="settings-item-title">Automatic Updates</h4>
              <p class="settings-item-description">Automatically download and install updates when available</p>
            </div>
            <div class="settings-toggle" id="updater-auto-update-toggle">
              <div class="settings-toggle-handle"></div>
            </div>
          </div>

          <div class="update-actions">
            <div class="current-version" id="updater-current-version"></div>
            <button class="button" type="button" id="updater-check-btn">Check for Updates</button>
            <div class="update-status" id="updater-status" style="color: var(--text-secondary);"></div>
          </div>
        </div>
      </div>
    `;
  }

  protected override getFooterActions(): string {
    return `<button class="button" type="button" data-action="close">Close</button>`;
  }

  protected override async onOpen(): Promise<void> {
    await this.loadSettings();
    this.bindEvents();
    this.updateUI();

    try {
      const ver = await window.electronAPI.app.getVersion();
      const verEl = document.getElementById('updater-current-version');
      if (verEl) verEl.textContent = `Version ${ver}`;
    } catch {}
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'close') return true;
    return false;
  }

  // ----- Internals -----
  private async loadSettings(): Promise<void> {
    try {
      this.settings = await window.electronAPI.settings.get();
    } catch (e) {
      this.settings = {};
    }
  }

  private bindEvents(): void {
    const autoToggle = document.getElementById('updater-auto-update-toggle');
    autoToggle?.addEventListener('click', async () => {
      await this.handleToggle('autoUpdate');
    });

    const btn = document.getElementById('updater-check-btn') as HTMLButtonElement | null;
    const status = document.getElementById('updater-status');
    btn?.addEventListener('click', async () => {
      if (!btn || !status) return;
      btn.disabled = true;
      btn.classList.add('is-loading');
      status.textContent = 'Checking for updates...';
      try {
        const result = await window.electronAPI.app.checkForUpdates();
        if (result?.hasUpdate) {
          status.textContent = `Update available: ${result.version}`;
        } else {
          status.textContent = 'You are running the latest version';
        }
      } catch (e) {
        status.textContent = 'Unable to check for updates';
      } finally {
        btn.classList.remove('is-loading');
        btn.disabled = false;
      }
    });
  }

  private updateUI(): void {
    this.updateToggle('updater-auto-update-toggle', this.settings.autoUpdate === true);
  }

  private updateToggle(id: string, isActive: boolean): void {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('is-checked', isActive);
  }

  private async handleToggle(setting: string): Promise<void> {
    try {
      const currentValue = !!this.settings[setting];
      const newValue = !currentValue;
      await window.electronAPI.settings.set(setting, newValue);
      this.settings[setting] = newValue;
      this.updateUI();
    } catch (e) {
      // ignore
    }
  }
}
