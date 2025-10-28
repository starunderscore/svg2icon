// AboutModal - Standalone About dialog (content migrated from Settings)

import { Modal } from '../common/Modal.js';

export class AboutModal extends Modal {
  constructor() {
    super({ title: 'About', size: 'small', className: 'about-modal' });
  }

  protected override getContent(): string {
    return `
      <div class="about-modal-content" style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;text-align:left;min-width:420px;">
        <!-- App brand header -->
        <div class="app-brand" style="display:flex;align-items:center;gap:0.75rem;">
          <img src="../assets/this-app/icon-64.png" alt="SVG2Icon" width="44" height="44" style="image-rendering:auto;border-radius:10px;"/>
          <div style="display:flex;flex-direction:column;gap:0.15rem;">
            <h4 style="margin:0;color:var(--text-primary);line-height:1.2;letter-spacing:0.2px;">SVG2Icon</h4>
            <span id="about-current-version" style="display:inline-flex;align-items:center;gap:0.5rem;color:var(--text-secondary);font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.85rem;">v0.0.0</span>
          </div>
        </div>

        <!-- Tagline -->
        <p style="margin:0.25rem 0 0.25rem 0;color:var(--text-secondary);max-width:560px;">
          Generate complete, production‑ready icon sets from a single SVG — fast.
        </p>

        <!-- Meta row (subtle, retro monospace) -->
        <div style="display:flex;gap:1rem;flex-wrap:wrap;font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.85rem;color:var(--text-muted);">
          <span>Build: Desktop</span>
          <span>License: MIT</span>
        </div>

        <!-- Author card -->
        <div class="author-card" style="width:100%;max-width:560px;background:var(--bg-tertiary);border:1px solid var(--border-color);padding:0.9rem 1rem;display:flex;flex-direction:column;gap:0.6rem;">
          <div style="font-weight:600;color:var(--text-primary);">Author</div>
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <img src="../assets/star-underscore/favicon-32x32.png" alt="Star Underscore" width="22" height="22" style="border-radius:4px;"/>
            <div style="display:flex;flex-direction:column;line-height:1.2;">
              <span style="color:var(--text-primary);font-weight:600;">Star Underscore</span>
              <span style="color:var(--text-secondary);">Proudly made by StarUnderscore.com</span>
            </div>
          </div>
          <div class="links" style="display:flex;gap:0.5rem;">
            <button class="button is-primary" type="button" id="about-open-website">Visit Website</button>
            <button class="button is-ghost" type="button" id="about-open-changelog">Changelog</button>
            <button class="button is-ghost" type="button" id="about-open-licenses">Licenses</button>
          </div>
        </div>
      </div>
    `;
  }

  protected override getFooterActions(): string {
    return `<button class="button" type="button" data-action="close">Close</button>`;
  }

  protected override async onOpen(): Promise<void> {
    // Show app version
    try {
      const ver = await window.electronAPI.app.getVersion();
      const verEl = document.getElementById('about-current-version');
      if (verEl) verEl.textContent = `v${ver}`;
    } catch {}

    // Links
    const openSite = () => this.openExternalLink('https://www.starunderscore.com/products/maverick-spirit/svg2icon');
    const openChangelog = () => this.openExternalLink('https://github.com/starunderscore/svg2icon/releases');
    const openLicenses = () => this.openExternalLink('https://github.com/starunderscore/svg2icon/blob/main/LICENSE');
    document.getElementById('about-open-website')?.addEventListener('click', openSite);
    document.getElementById('about-open-changelog')?.addEventListener('click', openChangelog);
    document.getElementById('about-open-licenses')?.addEventListener('click', openLicenses);
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'close') return true;
    return false;
  }

  private openExternalLink(url: string): void {
    try {
      // Ask main process to open the link in default browser
      // Non-blocking; errors are logged to console
      (async () => {
        try {
          const ok = await window.electronAPI.app.openExternal(url);
          if (!ok) console.warn('Open external returned false:', url);
        } catch (e) {
          console.error('Failed to open external link:', url, e);
        }
      })();
    } catch (e) {
      console.error('Open external link handler error:', e);
    }
  }
}
