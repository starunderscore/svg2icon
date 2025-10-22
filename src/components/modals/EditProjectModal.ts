// EditProjectModal - Modal for editing existing projects

import { Modal } from '../common/Modal.js';
import type { Project, UpdateProjectData } from '../../types/Project.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

interface EditProjectModalProps {
  project: Project;
  projectService: ProjectService;
  eventManager: EventManager;
}

export class EditProjectModal extends Modal {
  private props: EditProjectModalProps;
  private projectName: string;
  private selectedFile: File | null = null;
  private svgMode: 'preview' | 'upload' = 'preview';

  constructor(props: EditProjectModalProps) {
    super({
      title: 'Edit Project',
      size: 'medium',
      className: 'edit-project-modal'
    });
    this.props = props;
    this.projectName = props.project.name;
    // icon types removed from UI; keep existing project data unchanged
  }

  protected override getContent(): string {
    return `
      <div class="edit-project-form">
        <div class="form-section">
          <label class="label">SVG</label>
          <div id="svg-section" class="svg-section-container">
            <!-- Filled on open -->
          </div>
        </div>

        <div class="form-section">
          <label class="label">Project Name</label>
          <div class="control">
            <input 
              id="project-name-input" 
              class="input" 
              type="text" 
              value="${this.escapeHtml(this.projectName)}"
              maxlength="100"
            />
          </div>
        </div>

        
        
      </div>
    `;
  }

  protected override getFooterActions(): string {
    return `
      <button class="button" type="button" data-action="cancel">Cancel</button>
      <button class="button is-primary" type="button" data-action="save">
        Save Changes
      </button>
    `;
  }

  protected override async onOpen(): Promise<void> {
    this.bindFormEvents();
    this.renderSvgSection();
    this.bindSvgSectionEvents();
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'cancel') {
      return true; // Close modal
    }

    if (action === 'save') {
      try {
        await this.saveChanges();
        return true; // Close modal on success
      } catch (error) {
        console.error('Failed to save changes:', error);
        this.showError(error instanceof Error ? error.message : 'Failed to save changes');
        return false; // Keep modal open
      }
    }

    return false;
  }

  private bindFormEvents(): void {
    const nameInput = document.getElementById('project-name-input') as HTMLInputElement;
    
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.projectName = target.value.trim();
      });
    }

    // No icon type checkboxes anymore
  }

  // No action buttons in edit modal

  // Icon types removed

  private async saveChanges(): Promise<void> {
    if (!this.projectName) {
      throw new Error('Project name cannot be empty.');
    }

    // No icon types to validate

    const updates: UpdateProjectData = {};
    let hasChanges = false;

    // Check if name changed
    if (this.projectName !== this.props.project.name) {
      updates.name = this.projectName;
      hasChanges = true;
    }

    // Icon types are not editable anymore

    // If new SVG selected, include it
    if (this.selectedFile) {
      (updates as any).svgFile = this.selectedFile;
      hasChanges = true;
    }

    if (hasChanges) {
      const updatedProject = await this.props.projectService.update(this.props.project.id, updates);
      this.props.eventManager.emit('project:updated', updatedProject);
    }
  }

  // Actions removed (regenerate, download original)

  private createSvgPreview(): string {
    if (this.selectedFile) {
      // Show temporary preview for newly selected file
      return `<img id="svg-live-preview" alt="SVG Preview" />`;
    }

    if (!this.props.project.svgData) {
      return `
        <div class="svg-preview-placeholder">No preview available</div>
      `;
    }

    try {
      const dataUrl = `data:image/svg+xml;base64,${this.props.project.svgData}`;
      return `<img src="${dataUrl}" alt="SVG Preview" />`;
    } catch (error) {
      return `
        <div class="svg-preview-placeholder">Invalid SVG data</div>
      `;
    }
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  // Success notifications no longer used here

  private showError(message: string): void {
    // Implement error notification
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

  private renderSvgSection(): void {
    const container = document.getElementById('svg-section');
    if (!container) return;

    if (this.svgMode === 'preview' && (this.selectedFile || this.props.project.svgData)) {
      container.innerHTML = `
        <div class="svg-fixed">
          <div class="svg-preview-large">
            ${this.createSvgPreview()}
          </div>
          <button id="btn-remove-svg" class="button svg-replace-btn" type="button">Replace SVG</button>
        </div>
      `;

      // If showing live preview for selected file, load it into img
      if (this.selectedFile) {
        const img = document.getElementById('svg-live-preview') as HTMLImageElement | null;
        if (img) {
          const reader = new FileReader();
          reader.onload = () => { img.src = reader.result as string; };
          reader.readAsDataURL(this.selectedFile);
        }
      }
    } else {
      container.innerHTML = `
        <div id="svg-dropzone" class="file-upload-area svg-dropzone" role="button" tabindex="0" aria-label="Upload SVG file">
          <div class="file-upload-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <div class="file-upload-text">Drop your SVG file here or click to browse</div>
          <div class="file-upload-hint">Supports SVG up to 10MB</div>
        </div>
        <button id="btn-cancel-replace" class="button svg-cancel-action" type="button" title="Cancel">Cancel</button>
        <input id="svg-file-input" type="file" accept=".svg,image/svg+xml" style="display: none;" />
      `;
    }
  }

  private bindSvgSectionEvents(): void {
    const container = document.getElementById('svg-section');
    if (!container) return;

    const removeBtn = document.getElementById('btn-remove-svg');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.svgMode = 'upload';
        this.renderSvgSection();
        this.bindSvgSectionEvents();
      });
    }

    const dropzone = document.getElementById('svg-dropzone');
    const fileInput = document.getElementById('svg-file-input') as HTMLInputElement | null;
    const cancelBtn = document.getElementById('btn-cancel-replace');
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('is-active'); });
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-active'));
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault(); dropzone.classList.remove('is-active');
        const f = e.dataTransfer?.files?.[0]; if (f) this.handleNewSvgFile(f);
      });
      fileInput.addEventListener('change', (e) => {
        const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.handleNewSvgFile(f);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        // Return to preview without changing selected file
        this.svgMode = 'preview';
        this.renderSvgSection();
        this.bindSvgSectionEvents();
      });
    }
  }

  private handleNewSvgFile(file: File): void {
    // Basic validation similar to ProjectService
    if (!file.name.toLowerCase().endsWith('.svg') && !(file.type || '').includes('svg')) {
      alert('Please select a valid SVG file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }
    this.selectedFile = file;
    this.svgMode = 'preview';
    this.renderSvgSection();
    this.bindSvgSectionEvents();
  }
}
