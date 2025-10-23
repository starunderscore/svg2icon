// DeleteProjectModal - GitHub-style delete confirmation modal

import { Modal } from '../common/Modal.js';
import type { Project } from '../../types/Project.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

interface DeleteProjectModalProps {
  project: Project;
  projectService: ProjectService;
  eventManager: EventManager;
}

export class DeleteProjectModal extends Modal {
  private props: DeleteProjectModalProps;
  private confirmationInput = '';
  private isCopied = false;

  constructor(props: DeleteProjectModalProps) {
    super({
      title: 'Delete Project',
      size: 'medium',
      className: 'delete-project-modal'
    });
    this.props = props;
  }

  protected override getContent(): string {
    const projectName = this.props.project.name;
    
    return `
      <div class="delete-confirmation">
        <div class="delete-warning-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        
        <h3 class="delete-warning-title">Are you absolutely sure?</h3>
        <p class="delete-warning-text">
          This action cannot be undone. This will permanently delete the project 
          <strong>"${this.escapeHtml(projectName)}"</strong> and all associated data.
        </p>
        <div class="form-section">
          <label class="label" for="project-name-copy-input">Project name</label>
          <div class="control has-right-action">
            <input 
              id="project-name-copy-input"
              class="input"
              type="text"
              value="${this.escapeHtml(projectName)}"
              disabled
              aria-disabled="true"
            />
            <button class="copy-button copy-button-inline" type="button" id="copy-button" title="Copy name">
              ${this.isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        
        <div class="form-section">
          <input 
            id="confirmation-input" 
            class="delete-confirmation-input" 
            type="text" 
            placeholder="Type the project name here"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>
    `;
  }

  protected override getFooterActions(): string {
    return `
      <button class="button" type="button" data-action="cancel">Cancel</button>
      <button class="button is-danger" type="button" id="delete-confirm-btn" data-action="delete" disabled>
        I understand the consequences, delete this project
      </button>
    `;
  }

  protected override async onOpen(): Promise<void> {
    this.setupCopyButton();
    this.setupConfirmationInput();
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'cancel') {
      // Close without confirming deletion
      this.setResult(false);
      return true;
    }

    if (action === 'delete') {
      if (this.confirmationInput !== this.props.project.name) {
        this.showInputError('Project name does not match');
        return false; // Keep modal open
      }

      // Confirm; actual deletion will be handled by caller
      this.setResult(true);
      return true;
    }

    return false;
  }

  private setupCopyButton(): void {
    const copyButton = document.getElementById('copy-button');
    const projectNameInput = document.getElementById('project-name-copy-input') as HTMLInputElement | null;

    if (copyButton && projectNameInput) {
      copyButton.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(projectNameInput.value);
          this.setCopiedState(true);
          
          // Reset copy state after 2 seconds
          setTimeout(() => {
            this.setCopiedState(false);
          }, 2000);
        } catch (error) {
          // Fallback for browsers that don't support clipboard API
          projectNameInput.select();
        }
      });
    }
  }

  private setupConfirmationInput(): void {
    const input = document.getElementById('confirmation-input') as HTMLInputElement;
    const deleteButton = document.getElementById('delete-confirm-btn') as HTMLButtonElement;

    if (input && deleteButton) {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.confirmationInput = target.value;
        
        const isValid = this.confirmationInput === this.props.project.name;
        deleteButton.disabled = !isValid;
        
        // Update input styling
        input.classList.remove('is-invalid', 'is-valid');
        if (this.confirmationInput.length > 0) {
          input.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }
      });

      input.addEventListener('paste', (e) => {
        // Allow pasting but still validate
        setTimeout(() => {
          input.dispatchEvent(new Event('input'));
        }, 0);
      });

      // Focus the input
      setTimeout(() => {
        input.focus();
      }, 100);
    }
  }

  private setCopiedState(copied: boolean): void {
    this.isCopied = copied;
    const copyButton = document.getElementById('copy-button');
    
    if (copyButton) {
      copyButton.textContent = copied ? 'Copied!' : 'Copy';
      copyButton.classList.toggle('is-copied', copied);
    }
  }

  private selectText(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  private showInputError(message: string): void {
    const input = document.getElementById('confirmation-input');
    if (input) {
      input.classList.add('is-invalid');
      
      // Create or update error message
      let errorElement = document.querySelector('.confirmation-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'help is-danger confirmation-error';
        input.parentNode?.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      
      // Remove error after 3 seconds
      setTimeout(() => {
        input.classList.remove('is-invalid');
        errorElement?.remove();
      }, 3000);
    }
  }

  private showError(message: string): void {
    // You could implement a toast notification here
    // For now, just alert
    alert(message);
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
