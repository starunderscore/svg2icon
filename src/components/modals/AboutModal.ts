// AboutModal - Standalone About dialog (content migrated from Settings)

import { Modal } from '../common/Modal.js';

export class AboutModal extends Modal {
  constructor() {
    super({ title: 'About', size: 'small', className: 'about-modal' });
  }

  protected override getContent(): string {
    return `
      <div class="about-modal-content" style="display:flex;flex-direction:column;gap:1rem;align-items:flex-start;text-align:left;">
        <div class="app-brand" style="display:flex;align-items:center;gap:0.75rem;">
          <img src="../assets/this-app/icon-64.png" alt="SVG2Icon" width="40" height="40" style="image-rendering:auto;border-radius:8px;"/>
          <div>
            <h4 style="margin:0;color:var(--text-primary);line-height:1.2;">SVG2Icon</h4>
            <div id="about-current-version" style="color:var(--text-secondary);font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.85rem;margin-top:0.125rem;"></div>
          </div>
        </div>

        <div class="about-copy" style="color:var(--text-secondary);max-width:520px;">
          <p style="margin:0.25rem 0 0.5rem 0;">Retro-flavored, text-forward icon pack generator from a single SVG.</p>
        </div>

        <!-- Author card (minimal modern) -->
        <div class="author-card" style="width:100%;max-width:520px;background:var(--bg-tertiary);border:1px solid var(--border-color);padding:0.75rem 1rem;">
          <div style="font-weight:600;color:var(--text-primary);margin-bottom:0.5rem;">Author</div>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
            <img src="../assets/star-underscore/favicon-32x32.png" alt="Star Underscore" width="20" height="20" style="border-radius:4px;"/>
            <span style="color:var(--text-secondary);font-weight:600;">Star Underscore</span>
          </div>
          <div class="links" style="display:flex;gap:0.5rem;justify-content:flex-start;">
            <button class="button is-primary" type="button" id="about-open-website">Visit Website</button>
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
      if (verEl) verEl.textContent = `Version ${ver}`;
    } catch {}

    // Links
    const openSite = () => this.openExternalLink('https://www.starunderscore.com/products/maverick-spirit/svg2icon');
    document.getElementById('about-open-website')?.addEventListener('click', openSite);
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'close') return true;
    return false;
  }

  private openExternalLink(url: string): void {
    // Placeholder: opening external links can be implemented via IPC if needed
    console.log('Opening external link:', url);
  }
}
