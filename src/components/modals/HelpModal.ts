// HelpModal - Simple placeholder help dialog

import { Modal } from '../common/Modal.js';

export class HelpModal extends Modal {
  constructor() {
    super({ title: 'Help', size: 'medium', className: 'help-modal' });
  }

  protected override getContent(): string {
    return `
      <div class="help-modal-content">
        <p class="help-text">Coming soon...</p>
      </div>
    `;
  }

  protected override getFooterActions(): string {
    return `<button class="button" type="button" data-action="close">Close</button>`;
  }
}

