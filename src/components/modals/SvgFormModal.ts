// SvgFormModal - Unified modal for creating and editing SVG projects

import { Modal } from '../common/Modal.js';
import type { Project } from '../../types/Project.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

type Mode = 'create' | 'edit';

interface SvgFormModalProps {
  mode: Mode;
  projectService: ProjectService;
  eventManager: EventManager;
  project?: Project;
}

export class SvgFormModal extends Modal {
  private props: SvgFormModalProps;
  private projectName = '';
  private selectedFile: File | null = null;
  private svgMode: 'preview' | 'upload' = 'upload';
  private existingNames: Set<string> = new Set();

  constructor(props: SvgFormModalProps) {
    super({ title: props.mode === 'create' ? 'Create New Project' : 'Edit Project', size: 'medium', className: 'svg-form-modal' });
    this.props = props;
    if (props.mode === 'edit' && props.project) {
      this.projectName = props.project.name;
      this.svgMode = 'preview';
    }
  }

  protected override getContent(): string {
    return `
      <div class="svg-form">
        <div class="form-section">
          <label class="label">SVG</label>
          <div id="svg-section" class="svg-section-container"></div>
        </div>

        <div class="form-section">
          <label class="label">Project Name</label>
          <div class="control">
            <input id="project-name-input" class="input" type="text" placeholder="e.g., Client Portal Icons, Personal Blog Logo" maxlength="100" value="${this.escapeHtml(this.projectName)}" />
            <div id="name-error" class="help" style="min-height: 1.25rem; color: var(--text-muted);"></div>
          </div>
        </div>
      </div>
    `;
  }

  protected override getFooterActions(): string {
    const primary = this.props.mode === 'create' ? 'Create Project' : 'Save Changes';
    return `<button class="button" type="button" data-action="cancel">Cancel</button>
            <button class="button is-primary" type="button" data-action="save" ${this.props.mode === 'create' ? 'disabled' : ''}>${primary}</button>`;
  }

  protected override async onOpen(): Promise<void> {
    try {
      const all = await this.props.projectService.getAll();
      const selfId = this.props.project?.id;
      all.filter(p => p.id !== selfId).forEach(p => this.existingNames.add(p.name.toLowerCase()));
    } catch {}
    this.renderSvgSection();
    this.bindSvgSectionEvents();
    this.bindFormEvents();
  }

  protected override async onAction(action: string): Promise<boolean> {
    if (action === 'cancel') return true;
    if (action === 'save') {
      try {
        if (this.props.mode === 'create') {
          await this.createProject();
          this.setResult(true);
          return true;
        } else {
          await this.saveChanges();
          this.setResult(true);
          return true;
        }
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Operation failed');
        return false;
      }
    }
    return false;
  }

  private bindFormEvents(): void {
    const nameInput = document.getElementById('project-name-input') as HTMLInputElement | null;
    const primaryBtn = document.querySelector('[data-action="save"]') as HTMLButtonElement | null;
    nameInput?.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement;
      const filtered = el.value.replace(/[^A-Za-z0-9 _.-]/g, '');
      if (filtered !== el.value) {
        const pos = el.selectionStart || filtered.length;
        el.value = filtered;
        el.setSelectionRange(pos, pos);
      }
      this.projectName = el.value.trim();
      this.applyNameValidation();
      if (primaryBtn && this.props.mode === 'create') {
        const ok = this.projectName && this.selectedFile && this.isNameValid(this.projectName);
        primaryBtn.disabled = !ok;
      }
    });

    this.applyNameValidation();
  }

  private renderSvgSection(): void {
    const container = document.getElementById('svg-section');
    if (!container) return;

    const inEditWithExisting = this.props.mode === 'edit' && !!this.props.project?.svgData;
    const hasPreview = this.selectedFile || inEditWithExisting;

    if (this.svgMode === 'preview' && hasPreview) {
      container.innerHTML = `
        <div class="svg-fixed">
          <div class="svg-preview-large">
            ${this.createSvgPreview()}
          </div>
          <button id="btn-replace-svg" class="button svg-replace-btn" type="button">Replace SVG</button>
        </div>
        <input id="svg-file-input" type="file" accept=".svg,image/svg+xml" style="display:none;" />
      `;

      if (this.selectedFile) {
        const img = document.getElementById('svg-live-preview') as HTMLImageElement | null;
        if (img) {
          const reader = new FileReader();
          reader.onload = () => (img.src = reader.result as string);
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
        ${hasPreview ? '<button id="btn-cancel-replace" class="button svg-cancel-action" type="button" title="Cancel">Cancel</button>' : ''}
        <input id="svg-file-input" type="file" accept=".svg,image/svg+xml" style="display:none;" />
      `;
    }
  }

  private bindSvgSectionEvents(): void {
    const replaceBtn = document.getElementById('btn-replace-svg');
    const cancelBtn = document.getElementById('btn-cancel-replace');
    const dropzone = document.getElementById('svg-dropzone');
    const fileInput = document.getElementById('svg-file-input') as HTMLInputElement | null;

    if (replaceBtn) {
      replaceBtn.addEventListener('click', () => {
        this.svgMode = 'upload';
        this.renderSvgSection();
        this.bindSvgSectionEvents();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
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

  private handleNewSvgFile(file: File): void {
    if (!this.isValidSvgFile(file)) { alert('Please select a valid SVG file < 10MB.'); return; }
    this.selectedFile = file;
    if (!this.projectName) {
      const base = file.name.replace(/\.[^/.]+$/, '');
      this.projectName = base.charAt(0).toUpperCase() + base.slice(1);
      const nameInput = document.getElementById('project-name-input') as HTMLInputElement | null;
      if (nameInput) nameInput.value = this.projectName;
    }
    const primaryBtn = document.querySelector('[data-action="save"]') as HTMLButtonElement | null;
    if (primaryBtn && this.props.mode === 'create') {
      const ok = this.projectName && this.selectedFile && this.isNameValid(this.projectName);
      primaryBtn.disabled = !ok;
    }
    this.svgMode = 'preview';
    this.renderSvgSection();
    this.bindSvgSectionEvents();
  }

  private createSvgPreview(): string {
    if (this.selectedFile) {
      return `<img id="svg-live-preview" alt="SVG Preview" />`;
    }
    if (this.props.mode === 'edit' && this.props.project?.svgData) {
      const dataUrl = `data:image/svg+xml;base64,${this.props.project.svgData}`;
      return `<img src="${dataUrl}" alt="SVG Preview" />`;
    }
    return `<div class="svg-preview-placeholder">No preview available</div>`;
  }

  private async createProject(): Promise<void> {
    if (!this.projectName || !this.selectedFile) throw new Error('Please provide a project name and select an SVG file.');
    const project = await this.props.projectService.create({ name: this.projectName, svgFile: this.selectedFile });
    try {
      this.props.eventManager.emit('project:created', project);
    } catch {}
  }

  private async saveChanges(): Promise<void> {
    if (!this.props.project) throw new Error('Missing project');
    const updates: any = {};
    if (this.projectName && this.projectName !== this.props.project.name) updates.name = this.projectName;
    if (this.selectedFile) updates.svgFile = this.selectedFile;
    if (Object.keys(updates).length) {
      const updatedProject = await this.props.projectService.update(this.props.project.id, updates);
      this.props.eventManager.emit('project:updated', updatedProject);
    }
  }

  private isValidSvgFile(file: File): boolean {
    if (!file.name.toLowerCase().endsWith('.svg')) return false;
    if (file.type && !file.type.includes('svg')) return false;
    if (file.size > 10 * 1024 * 1024) return false;
    return true;
  }

  private isNameValid(name: string): boolean {
    if (!name) return false;
    if (!/^[A-Za-z0-9 _.-]+$/.test(name)) return false;
    if (this.existingNames.has(name.toLowerCase())) return false;
    return true;
  }

  private applyNameValidation(): void {
    const input = document.getElementById('project-name-input') as HTMLInputElement | null;
    const hint = document.getElementById('name-error') as HTMLDivElement | null;
    if (!input || !hint) return;
    const name = this.projectName;
    let error = '';
    if (!name) {
      error = '';
    } else if (!/^[A-Za-z0-9 _.-]+$/.test(name)) {
      error = 'Use letters, numbers, space, dot, dash, underscore only';
    } else if (this.existingNames.has(name.toLowerCase())) {
      error = 'A project with this name already exists';
    }
    input.classList.remove('is-invalid', 'is-valid');
    if (name.length > 0) {
      input.classList.add(error ? 'is-invalid' : 'is-valid');
    }
    hint.textContent = error;
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
