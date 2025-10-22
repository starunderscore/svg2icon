// ProjectActions component - Dropdown menu for project actions

import type { Project, IconType } from '../../types/Project.js';

interface ProjectActionsProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onGenerate: (iconType: IconType) => void;
}

export class ProjectActions {
  private props: ProjectActionsProps;
  private container: HTMLElement | null = null;

  constructor(props: ProjectActionsProps) {
    this.props = props;
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.updateHTML();
    this.attachEventListeners();
  }

  updateProject(project: Project): void {
    this.props.project = project;
    if (this.container) {
      this.updateHTML();
      this.attachEventListeners();
    }
  }

  private updateHTML(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <button class="dropdown-item" data-action="edit">
        <span class="dropdown-icon">✏️</span>
        Edit Project
      </button>
      
      <div class="dropdown-divider"></div>
      <button class="dropdown-item is-danger" data-action="delete">
        <span class="dropdown-icon">🗑️</span>
        Delete Project
      </button>
    `;
  }

  private attachEventListeners(): void {
    if (!this.container) return;

    const actionItems = this.container.querySelectorAll('[data-action]');
    actionItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAction(e.target as HTMLElement);
      });
    });
  }

  private handleAction(element: HTMLElement): void {
    const action = element.dataset.action;
    const iconType = element.dataset.iconType;

    switch (action) {
      case 'edit':
        this.props.onEdit(this.props.project);
        break;
        
      case 'generate':
        if (iconType) {
          this.props.onGenerate(iconType as IconType);
        }
        break;
        
      case 'delete':
        this.props.onDelete(this.props.project);
        break;
    }

    // Close the dropdown
    this.closeDropdown();
  }

  // Removed duplicate/export actions per current UX

  private closeDropdown(): void {
    const dropdown = this.container?.closest('.dropdown-menu');
    if (dropdown) {
      if (dropdown.classList.contains('dropdown-portal')) {
        // Remove portal menu from body
        dropdown.remove();
      } else {
        dropdown.classList.remove('is-active');
      }
    }
  }
}
