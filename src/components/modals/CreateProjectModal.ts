// CreateProjectModal - Modal for creating new SVG projects (v1.1.0)
import { Modal } from '../common/Modal.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

interface CreateProjectModalProps {
  projectService: ProjectService;
  eventManager: EventManager;
}

export class CreateProjectModal extends Modal {
  private props: CreateProjectModalProps;
  private selectedFile: File | null = null;
  private projectName = '';
  private svgMode: 'preview' | 'upload' = 'upload';

  constructor(props: CreateProjectModalProps) {
    super({ title: 'Create New Project', size: 'medium', className: 'create-project-modal' });
    this.props = props;
  }

  protected override getContent(): string {
    return `
      <div class="create-project-form">
        <div class="form-section">
          <label class="label">SVG</label>
          <div id="svg-section" class="svg-section-container">
            <!-- Filled on open -->
          </div>
        </div>
        <div class="form-section">
          <label class="label">Project Name</label>
          <div class="control">
            <input id="project-name-input" class="input" type="text" placeholder="e.g., Client Portal Icons, Personal Blog Logo" maxlength="100" />
          </div>
        </div>
        
      </div>`;
  }

  protected override getFooterActions(): string {
    return `<button class="button" type="button" data-action="cancel">Cancel</button>
            <button class="button is-primary" type="button" data-action="create" disabled>Create Project</button>`;
  }

  protected override async onOpen(): Promise<void> {
    this.renderSvgSection();
    this.bindSvgSectionEvents();
    this.bindFormEvents();
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'cancel') return true;
    if (action === 'create') {
      try { await this.createProject(); return true; }
      catch (e) { alert(e instanceof Error ? e.message : 'Failed to create project'); return false; }
    }
    return false;
  }

  private renderSvgSection(): void {
    const container = document.getElementById('svg-section');
    if (!container) return;

    if (this.svgMode === 'preview' && this.selectedFile) {
      container.innerHTML = `
        <div class="svg-fixed">
          <div class="svg-preview-large">
            <img id="svg-live-preview" alt="SVG Preview" />
          </div>
          <button id="btn-replace-svg" class="button svg-replace-btn" type="button">Replace SVG</button>
        </div>
        <input id="svg-file-input" type="file" accept=".svg,image/svg+xml" style="display:none;" />
      `;

      // Load selected file preview
      const img = document.getElementById('svg-live-preview') as HTMLImageElement | null;
      if (img) {
        const reader = new FileReader();
        reader.onload = () => { img.src = reader.result as string; };
        reader.readAsDataURL(this.selectedFile);
      }
    } else {
      // Upload mode
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
        ${this.selectedFile ? '<button id="btn-cancel-replace" class="button svg-cancel-action" type="button" title="Cancel">Cancel</button>' : ''}
        <input id="svg-file-input" type="file" accept=".svg,image/svg+xml" style="display:none;" />
      `;
    }
  }

  private bindSvgSectionEvents(): void {
    const replaceBtn = document.getElementById('btn-replace-svg');
    const dropzone = document.getElementById('svg-dropzone');
    const fileInput = document.getElementById('svg-file-input') as HTMLInputElement | null;
    const cancelBtn = document.getElementById('btn-cancel-replace');

    if (replaceBtn && fileInput) {
      replaceBtn.addEventListener('click', () => {
        // Switch to upload mode to pick another SVG
        this.svgMode = 'upload';
        this.renderSvgSection();
        this.bindSvgSectionEvents();
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        // Return to preview of the currently selected file
        this.svgMode = 'preview';
        this.renderSvgSection();
        this.bindSvgSectionEvents();
      });
    }

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
  }

  private bindFormEvents(): void {
    const nameInput = document.getElementById('project-name-input') as HTMLInputElement;
    nameInput?.addEventListener('input', (e) => { this.projectName = (e.target as HTMLInputElement).value.trim(); this.validateForm(); });
  }

  private handleNewSvgFile(file: File): void {
    if (!this.validateFile(file)) return;
    this.selectedFile = file;
    // If project name empty, derive from filename
    if (!this.projectName) {
      const base = file.name.replace(/\.[^/.]+$/, '');
      this.projectName = base.charAt(0).toUpperCase() + base.slice(1);
      const nameInput = document.getElementById('project-name-input') as HTMLInputElement; if (nameInput) nameInput.value = this.projectName;
    }
    // Switch to preview mode
    this.svgMode = 'preview';
    this.renderSvgSection();
    this.bindSvgSectionEvents();
    this.validateForm();
  }

  private validateFile(file: File): boolean {
    const errorElement = document.getElementById('file-error');
    if (errorElement) { errorElement.style.display = 'none'; errorElement.textContent = ''; }
    const badType = !file.name.toLowerCase().endsWith('.svg') && !(file.type || '').includes('svg');
    if (badType) return this.showFileError('Please select a valid SVG file.'), false;
    if (file.size > 10 * 1024 * 1024) return this.showFileError('File size must be less than 10MB.'), false;
    return true;
  }

  private showFileError(message: string): void {
    const errorElement = document.getElementById('file-error');
    const uploadArea = document.getElementById('file-upload-area');
    if (errorElement) { errorElement.textContent = message; errorElement.style.display = 'block'; }
    uploadArea?.classList.add('file-upload-error'); setTimeout(() => uploadArea?.classList.remove('file-upload-error'), 3000);
  }

  // upload UI managed in svg section

  private validateForm(): void {
    const btn = document.querySelector('[data-action="create"]') as HTMLButtonElement | null;
    if (btn) btn.disabled = !(this.projectName && this.selectedFile);
  }

  private async createProject(): Promise<void> {
    if (!this.selectedFile || !this.projectName) throw new Error('Please provide a project name and select an SVG file.');
    const project = await this.props.projectService.create({ name: this.projectName, svgFile: this.selectedFile });
    this.props.eventManager.emit('project:created', project);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'; const k = 1024; const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
