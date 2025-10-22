// MainContent component - Main application content area

import { ProjectTable } from '../project/ProjectTable.js';
import type { Project } from '../../types/Project.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

interface MainContentProps {
  eventManager: EventManager;
  projectService: ProjectService;
}

export class MainContent {
  private props: MainContentProps;
  private container: HTMLElement | null = null;
  private projectTable: ProjectTable;
  private projects: Project[] = [];

  constructor(props: MainContentProps) {
    this.props = props;
    this.projectTable = new ProjectTable({
      eventManager: props.eventManager,
      projectService: props.projectService
    });
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.updateHTML();
    this.initializeComponents();
  }

  setProjects(projects: Project[]): void {
    this.projects = projects;
    this.projectTable.setProjects(projects);
    this.updateEmptyState();
  }

  refreshProjects(projects: Project[]): void {
    this.setProjects(projects);
  }

  private updateHTML(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="main-content-inner">
        <div id="project-table-container" class="project-table-wrapper">
          <!-- Project table will be rendered here -->
        </div>
        <div id="empty-state" class="empty-state" style="display: none;">
          <div class="empty-state-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <h3 class="empty-state-title">No SVG projects yet</h3>
          <p class="empty-state-description">
            Create your first project by uploading an SVG file.
            You'll be able to generate complete icon sets for mobile, desktop, and web platforms.
          </p>
        </div>
        <div class="app-footer">
          <div class="app-footer-inner">
            <div class="footer-left">
              <span class="footer-project-count">0 projects</span>
            </div>
            <div class="footer-right"></div>
          </div>
        </div>
      </div>
    `;
  }

  private initializeComponents(): void {
    if (!this.container) return;

    const tableContainer = this.container.querySelector('#project-table-container');
    if (tableContainer) {
      this.projectTable.render(tableContainer as HTMLElement);
    }

    // No toolbar action here (moved to header)
  }

  private updateEmptyState(): void {
    if (!this.container) return;

    const tableContainer = this.container.querySelector('#project-table-container');
    const emptyState = this.container.querySelector('#empty-state');

    if (this.projects.length === 0) {
      tableContainer?.setAttribute('style', 'display: none;');
      emptyState?.setAttribute('style', 'display: block;');
    } else {
      tableContainer?.setAttribute('style', 'display: block;');
      emptyState?.setAttribute('style', 'display: none;');
    }

    // Update footer count
    const countEl = this.container.querySelector('.footer-project-count');
    if (countEl) {
      const n = this.projects.length;
      countEl.textContent = `${n} project${n === 1 ? '' : 's'}`;
    }
  }
}
