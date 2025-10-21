// EditProjectModal - Modal for editing existing projects

import { Modal } from '../common/Modal.js';
import type { Project, UpdateProjectData, IconType } from '../../types/Project.js';
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
  private selectedIconTypes: IconType[];

  constructor(props: EditProjectModalProps) {
    super({
      title: 'Edit Project',
      size: 'medium',
      className: 'edit-project-modal'
    });
    this.props = props;
    this.projectName = props.project.name;
    this.selectedIconTypes = [...props.project.iconTypes];
  }

  protected override getContent(): string {
    return `
      <div class="edit-project-form">
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
          <p class="help">Update the name to better describe your project.</p>
        </div>

        <div class="form-section">
          <label class="label">SVG Preview</label>
          <div class="svg-preview-container">
            <div class="svg-preview-large">
              ${this.createSvgPreview()}
            </div>
            <div class="svg-info">
              <div class="svg-info-item">
                <span class="label">Created:</span>
                <span class="value">${this.formatDate(this.props.project.createdAt)}</span>
              </div>
              <div class="svg-info-item">
                <span class="label">Last Updated:</span>
                <span class="value">${this.formatDate(this.props.project.updatedAt)}</span>
              </div>
              ${this.props.project.generatedAt ? `
                <div class="svg-info-item">
                  <span class="label">Last Generated:</span>
                  <span class="value">${this.formatDate(this.props.project.generatedAt)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="form-section">
          <label class="label">Icon Types</label>
          <div class="icon-type-checkboxes">
            <label class="checkbox-item">
              <input type="checkbox" value="universal" ${this.selectedIconTypes.includes('universal') ? 'checked' : ''} />
              <span class="checkmark"></span>
              <div class="checkbox-content">
                <div class="checkbox-label">Universal</div>
                <div class="checkbox-description">Complete cross-platform package</div>
              </div>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" value="ios" ${this.selectedIconTypes.includes('ios') ? 'checked' : ''} />
              <span class="checkmark"></span>
              <div class="checkbox-content">
                <div class="checkbox-label">iOS</div>
                <div class="checkbox-description">App Store ready icons</div>
              </div>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" value="android" ${this.selectedIconTypes.includes('android') ? 'checked' : ''} />
              <span class="checkmark"></span>
              <div class="checkbox-content">
                <div class="checkbox-label">Android</div>
                <div class="checkbox-description">Google Play ready icons</div>
              </div>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" value="desktop" ${this.selectedIconTypes.includes('desktop') ? 'checked' : ''} />
              <span class="checkmark"></span>
              <div class="checkbox-content">
                <div class="checkbox-label">Desktop</div>
                <div class="checkbox-description">Windows, macOS, Linux</div>
              </div>
            </label>
            <label class="checkbox-item">
              <input type="checkbox" value="web" ${this.selectedIconTypes.includes('web') ? 'checked' : ''} />
              <span class="checkmark"></span>
              <div class="checkbox-content">
                <div class="checkbox-label">Web</div>
                <div class="checkbox-description">PWA and favicons</div>
              </div>
            </label>
          </div>
          <p class="help">Select which icon formats you want to generate for this project.</p>
        </div>

        <div class="form-section">
          <label class="label">Actions</label>
          <div class="action-buttons">
            <button class="button is-primary" type="button" id="regenerate-icons">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Regenerate Icons
            </button>
            <button class="button" type="button" id="download-original">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Download Original SVG
            </button>
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
    this.bindActionButtons();
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

    // Bind checkbox events
    const checkboxes = document.querySelectorAll('.icon-type-checkboxes input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.updateSelectedIconTypes();
      });
    });
  }

  private bindActionButtons(): void {
    const regenerateBtn = document.getElementById('regenerate-icons');
    const downloadBtn = document.getElementById('download-original');

    regenerateBtn?.addEventListener('click', () => {
      this.handleRegenerateIcons();
    });

    downloadBtn?.addEventListener('click', () => {
      this.handleDownloadOriginal();
    });
  }

  private updateSelectedIconTypes(): void {
    const checkboxes = document.querySelectorAll('.icon-type-checkboxes input[type="checkbox"]:checked');
    this.selectedIconTypes = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value) as IconType[];
  }

  private async saveChanges(): Promise<void> {
    if (!this.projectName) {
      throw new Error('Project name cannot be empty.');
    }

    if (this.selectedIconTypes.length === 0) {
      throw new Error('Please select at least one icon type.');
    }

    const updates: UpdateProjectData = {};
    let hasChanges = false;

    // Check if name changed
    if (this.projectName !== this.props.project.name) {
      updates.name = this.projectName;
      hasChanges = true;
    }

    // Check if icon types changed
    const currentTypes = [...this.props.project.iconTypes].sort();
    const newTypes = [...this.selectedIconTypes].sort();
    if (JSON.stringify(currentTypes) !== JSON.stringify(newTypes)) {
      updates.iconTypes = this.selectedIconTypes;
      hasChanges = true;
    }

    if (hasChanges) {
      const updatedProject = await this.props.projectService.update(this.props.project.id, updates);
      this.props.eventManager.emit('project:updated', updatedProject);
    }
  }

  private async handleRegenerateIcons(): Promise<void> {
    try {
      const regenerateBtn = document.getElementById('regenerate-icons') as HTMLButtonElement;
      regenerateBtn.classList.add('is-loading');
      regenerateBtn.disabled = true;

      // Generate icons for each selected type
      for (const iconType of this.selectedIconTypes) {
        await this.props.projectService.generateIcons(this.props.project.id, iconType);
      }

      this.props.eventManager.emit('project:generation_completed', {
        projectId: this.props.project.id,
        iconTypes: this.selectedIconTypes
      });

      regenerateBtn.classList.remove('is-loading');
      regenerateBtn.disabled = false;
      
      // Show success message
      this.showSuccess('Icons regenerated successfully!');
    } catch (error) {
      console.error('Failed to regenerate icons:', error);
      this.showError('Failed to regenerate icons');
    }
  }

  private handleDownloadOriginal(): void {
    try {
      // Convert base64 to blob and download
      const svgData = atob(this.props.project.svgData);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.props.project.name}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download original SVG:', error);
      this.showError('Failed to download SVG file');
    }
  }

  private createSvgPreview(): string {
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

  private showSuccess(message: string): void {
    // Implement success notification
    console.log('Success:', message);
  }

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
}
