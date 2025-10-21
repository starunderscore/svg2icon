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

  constructor(props: CreateProjectModalProps) {
    super({ title: 'Create New Project', size: 'medium', className: 'create-project-modal' });
    this.props = props;
  }

  protected override getContent(): string {
    return `
      <div class="create-project-form">
        <div class="form-section">
          <label class="label">Project Name</label>
          <div class="control">
            <input id="project-name-input" class="input" type="text" placeholder="e.g., Client Portal Icons, Personal Blog Logo" maxlength="100" />
          </div>
          <p class="help">Give your project a descriptive name to easily identify it later.</p>
        </div>
        <div class="form-section">
          <label class="label">SVG File</label>
          <div id="file-upload-area" class="file-upload-area" role="button" tabindex="0" aria-label="Upload SVG file">
            <div class="file-upload-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            <div class="file-upload-text">Drop your SVG file here or click to browse</div>
            <div class="file-upload-hint">Supports SVG files up to 10MB</div>
          </div>
          <input id="file-input" type="file" accept=".svg,image/svg+xml" style="display: none;" />
          <div id="file-error" class="help is-danger" style="display: none;"></div>
        </div>
        <div class="form-section">
          <label class="label">Initial Icon Types (Optional)</label>
          <div class="icon-type-checkboxes">
            <label class="checkbox-item"><input type="checkbox" value="universal" checked /><span class="checkmark"></span><div class="checkbox-content"><div class="checkbox-label">Universal</div><div class="checkbox-description">Complete cross-platform package</div></div></label>
            <label class="checkbox-item"><input type="checkbox" value="ios" /><span class="checkmark"></span><div class="checkbox-content"><div class="checkbox-label">iOS</div><div class="checkbox-description">App Store ready icons</div></div></label>
            <label class="checkbox-item"><input type="checkbox" value="android" /><span class="checkmark"></span><div class="checkbox-content"><div class="checkbox-label">Android</div><div class="checkbox-description">Google Play ready icons</div></div></label>
            <label class="checkbox-item"><input type="checkbox" value="desktop" /><span class="checkmark"></span><div class="checkbox-content"><div class="checkbox-label">Desktop</div><div class="checkbox-description">Windows, macOS, Linux</div></div></label>
            <label class="checkbox-item"><input type="checkbox" value="web" /><span class="checkmark"></span><div class="checkbox-content"><div class="checkbox-label">Web</div><div class="checkbox-description">PWA and favicons</div></div></label>
          </div>
          <p class="help">You can always generate additional icon types later.</p>
        </div>
      </div>`;
  }

  protected override getFooterActions(): string {
    return `<button class="button" type="button" data-action="cancel">Cancel</button>
            <button class="button is-primary" type="button" data-action="create" disabled>Create Project</button>`;
  }

  protected override async onOpen(): Promise<void> {
    this.initializeFileUpload();
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

  private initializeFileUpload(): void {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (!uploadArea || !fileInput) return;
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('is-active'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('is-active'));
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault(); uploadArea.classList.remove('is-active');
      const f = e.dataTransfer?.files?.[0]; if (f) this.handleFileSelection(f);
    });
    fileInput.addEventListener('change', (e) => {
      const f = (e.target as HTMLInputElement).files?.[0]; if (f) this.handleFileSelection(f);
    });
  }

  private bindFormEvents(): void {
    const nameInput = document.getElementById('project-name-input') as HTMLInputElement;
    nameInput?.addEventListener('input', (e) => { this.projectName = (e.target as HTMLInputElement).value.trim(); this.validateForm(); });
  }

  private handleFileSelection(file: File): void {
    if (!this.validateFile(file)) return;
    this.selectedFile = file; this.updateFileUploadUI(file);
    if (!this.projectName) {
      const base = file.name.replace(/\.[^/.]+$/, '');
      this.projectName = base.charAt(0).toUpperCase() + base.slice(1);
      const nameInput = document.getElementById('project-name-input') as HTMLInputElement; if (nameInput) nameInput.value = this.projectName;
    }
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

  private updateFileUploadUI(file: File): void {
    const uploadArea = document.getElementById('file-upload-area'); if (!uploadArea) return;
    uploadArea.classList.add('file-upload-selected');
    uploadArea.innerHTML = `<div class="file-upload-icon"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
      <div class="file-upload-text">✓ ${file.name}</div>
      <div class="file-upload-hint">${this.formatFileSize(file.size)} • Click to change</div>`;
  }

  private validateForm(): void {
    const btn = document.querySelector('[data-action="create"]') as HTMLButtonElement | null;
    if (btn) btn.disabled = !(this.projectName && this.selectedFile);
  }

  private async createProject(): Promise<void> {
    if (!this.selectedFile || !this.projectName) throw new Error('Please provide a project name and select an SVG file.');
    const checks = document.querySelectorAll('.icon-type-checkboxes input[type="checkbox"]:checked');
    const iconTypes = Array.from(checks).map(cb => (cb as HTMLInputElement).value);
    const project = await this.props.projectService.create({ name: this.projectName, svgFile: this.selectedFile, initialIconTypes: (iconTypes.length ? iconTypes : ['universal']) as any });
    this.props.eventManager.emit('project:created', project);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'; const k = 1024; const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
