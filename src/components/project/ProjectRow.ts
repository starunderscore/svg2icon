// ProjectRow component - Individual table row for each project

import { ProjectActions } from './ProjectActions.js';
import type { Project } from '../../types/Project.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

interface ProjectRowProps {
  project: Project;
  projectService: ProjectService;
  eventManager: EventManager;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDownload: (project: Project, type: string) => void;
}

export class ProjectRow {
  private props: ProjectRowProps;
  private element: HTMLTableRowElement | null = null;
  private projectActions: ProjectActions;
  private isEditing = false;
  private actionsPortal: HTMLElement | null = null;

  constructor(props: ProjectRowProps) {
    this.props = props;
    this.projectActions = new ProjectActions({
      project: props.project,
      onEdit: props.onEdit,
      onDelete: props.onDelete
    });

    // Clear loading states when a download completes (success or error)
    this.props.eventManager.on('download:success', () => this.clearDownloadLoading());
    this.props.eventManager.on('download:error', () => this.clearDownloadLoading());
  }

  render(): HTMLTableRowElement {
    this.element = document.createElement('tr');
    this.element.className = 'project-row';
    this.element.dataset.projectId = this.props.project.id;
    
    this.updateHTML();
    this.attachEventListeners();
    
    return this.element;
  }

  updateProject(project: Project): void {
    this.props.project = project;
    this.projectActions.updateProject(project);
    this.updateHTML();
  }

  async animateDelete(): Promise<void> {
    if (!this.element) return;

    this.element.style.animation = 'slideOutUp 0.3s ease forwards';
    
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.element?.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        resolve();
      }, 300);
    });
  }

  private updateHTML(): void {
    if (!this.element) return;

    const project = this.props.project;
    const formattedDate = this.formatDate(project.createdAt);
    const svgPreview = this.createSvgPreview(project.svgData);

    this.element.innerHTML = `
      <td class="svg-preview-cell">
        ${svgPreview}
      </td>
      <td class="project-name-cell">
        ${this.isEditing ? this.getEditableNameHTML() : this.getNameHTML()}
      </td>
      <td class="project-date-cell">
        <span class="project-date">${formattedDate}</span>
      </td>
      <td class="download-buttons-cell">
        <div class="download-buttons">
          <button class="download-btn" data-download="all" title="Download all-in-one package">All</button>
          <button class="download-btn" data-download="mobile" title="Download mobile package">Mobile</button>
          <button class="download-btn" data-download="desktop" title="Download desktop package">Desktop</button>
          <button class="download-btn" data-download="web" title="Download web package">Web</button>
          <button class="download-btn" data-download="original" title="Download original SVG">SVG</button>
        </div>
      </td>
      <td class="project-actions-cell">
        <div class="project-actions">
          <button class="actions-trigger" type="button" title="More actions">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </button>
          <div id="actions-menu-${project.id}" class="dropdown-menu">
            <!-- Actions menu will be rendered here -->
          </div>
        </div>
      </td>
    `;

    // Render actions menu
    const actionsContainer = this.element.querySelector(`#actions-menu-${project.id}`);
    if (actionsContainer) {
      this.projectActions.render(actionsContainer as HTMLElement);
    }
  }

  private getNameHTML(): string {
    return `
      <div class="project-name" title="${this.props.project.name}">
        ${this.escapeHtml(this.props.project.name)}
      </div>
    `;
  }

  private getEditableNameHTML(): string {
    return `
      <input 
        class="project-name-editable" 
        type="text" 
        value="${this.escapeHtml(this.props.project.name)}"
        maxlength="100"
      />
    `;
  }

  private createSvgPreview(svgData: string): string {
    if (!svgData) {
      return `
        <div class="svg-preview">
          <div class="svg-preview-placeholder">No preview</div>
        </div>
      `;
    }

    try {
      // Convert base64 to data URL
      const dataUrl = `data:image/svg+xml;base64,${svgData}`;
      
      return `
        <div class="svg-preview">
          <img src="${dataUrl}" alt="SVG Preview" />
        </div>
      `;
    } catch (error) {
      return `
        <div class="svg-preview">
          <div class="svg-preview-placeholder">Invalid SVG</div>
        </div>
      `;
    }
  }

  private attachEventListeners(): void {
    if (!this.element) return;

    // Download buttons
    const downloadButtons = this.element.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = (button as HTMLElement).dataset.download;
        if (type) {
          this.handleDownload(type);
        }
      });
    });

    // Actions trigger
    const actionsTrigger = this.element.querySelector('.actions-trigger');
    actionsTrigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.actionsPortal) {
        this.closeActionsMenu();
      } else {
        this.openActionsMenu(actionsTrigger as HTMLElement);
      }
    });

    // Name editing
    const nameCell = this.element.querySelector('.project-name-cell');
    nameCell?.addEventListener('dblclick', () => {
      this.startEditing();
    });

    // Click outside to close menus
    document.addEventListener('click', (e) => {
      if (!this.element?.contains(e.target as Node)) {
        this.closeActionsMenu();
      }
    });
  }

  private startEditing(): void {
    this.isEditing = true;
    this.updateHTML();
    
    const input = this.element?.querySelector('.project-name-editable') as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
      
      const saveEdit = async () => {
        const newName = input.value.trim();
        if (newName && newName !== this.props.project.name) {
          try {
            const updated = await this.props.projectService.update(this.props.project.id, {
              name: newName
            });
            this.props.eventManager.emit('project:updated', updated);
          } catch (error) {
            console.error('Failed to update project name:', error);
          }
        }
        this.isEditing = false;
        this.updateHTML();
      };

      const cancelEdit = () => {
        this.isEditing = false;
        this.updateHTML();
      };

      input.addEventListener('blur', saveEdit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
        }
      });
    }
  }

  private handleDownload(type: string): void {
    const button = this.element?.querySelector(`[data-download="${type}"]`) as HTMLButtonElement;
    if (button) {
      button.classList.add('is-loading');
      
      this.props.onDownload(this.props.project, type);
      // Actual removal happens on global download events; keep a fallback timeout
      setTimeout(() => {
        button.classList.remove('is-loading');
      }, 5000);
    }
  }

  private clearDownloadLoading(): void {
    const buttons = this.element?.querySelectorAll('.download-btn.is-loading');
    if (!buttons) return;
    buttons.forEach(b => (b as HTMLButtonElement).classList.remove('is-loading'));
  }

  // Icon generation per type removed from row actions

  private toggleActionsMenu(): void {
    // legacy (no-op) retained for compatibility
  }

  private closeActionsMenu(): void {
    if (!this.actionsPortal) return;

    // Safely remove portal if it still exists in the DOM
    try {
      if (document.body.contains(this.actionsPortal)) {
        document.body.removeChild(this.actionsPortal);
      }
    } catch { /* ignore */ }

    this.actionsPortal = null;

    // Detach listeners
    document.removeEventListener('click', this.handleGlobalClick, true);
    window.removeEventListener('scroll', this.handleViewportChange, true);
    window.removeEventListener('resize', this.handleViewportChange, true);

    // Remove active state from trigger
    const trigger = this.element?.querySelector('.actions-trigger') as HTMLElement | null;
    if (trigger) {
      trigger.classList.remove('is-active');
    }
  }

  private openActionsMenu(trigger: HTMLElement): void {
    // Create a portal menu anchored to the trigger's viewport position
    const rect = trigger.getBoundingClientRect();
    const portal = document.createElement('div');
    portal.className = 'dropdown-menu dropdown-portal';
    portal.style.position = 'fixed';
    portal.style.zIndex = '2000';

    // Render actions into portal (needs to be in DOM to measure)
    this.projectActions.render(portal);
    document.body.appendChild(portal);

    // Measure and position within viewport
    const menuWidth = portal.offsetWidth;
    const menuHeight = portal.offsetHeight;
    const EDGE_PADDING = 8;   // keep away from top/bottom edges
    const OFFSET_Y = 6;       // nudge a bit down

    let top = rect.bottom + OFFSET_Y; // drop below trigger by default

    // If overflowing bottom, flip above trigger
    if (top + menuHeight > window.innerHeight - EDGE_PADDING) {
      top = rect.top - menuHeight;
    }
    if (top < EDGE_PADDING) top = EDGE_PADDING;

    // Position 25px from right edge for consistent alignment
    portal.style.right = `25px`;
    portal.style.left = 'auto';
    portal.style.top = `${Math.round(top)}px`;

    // Mark trigger active and trigger entrance animation after positioned
    (trigger as HTMLElement).classList.add('is-active');
    portal.classList.add('is-active');

    this.actionsPortal = portal;

    // Close handlers
    document.addEventListener('click', this.handleGlobalClick, true);
    window.addEventListener('scroll', this.handleViewportChange, true);
    window.addEventListener('resize', this.handleViewportChange, true);
  }

  private handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as Node;
    if (this.actionsPortal && !this.actionsPortal.contains(target)) {
      this.closeActionsMenu();
    }
  };

  private handleViewportChange = () => {
    // Close on scroll/resize to avoid misplacement
    this.closeActionsMenu();
  };

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    
    return date.toLocaleDateString();
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
