// ProjectTable component - Main data table for SVG projects

import { ProjectRow } from './ProjectRow.js';
import type { Project } from '../../types/Project.js';
import type { ProjectService } from '../../services/ProjectService.js';
import type { EventManager } from '../../utils/events.js';

interface ProjectTableProps {
  eventManager: EventManager;
  projectService: ProjectService;
}

export class ProjectTable {
  private props: ProjectTableProps;
  private container: HTMLElement | null = null;
  private projects: Project[] = [];
  private projectRows: Map<string, ProjectRow> = new Map();

  constructor(props: ProjectTableProps) {
    this.props = props;
    this.bindEvents();
  }

  render(container: HTMLElement): void {
    this.container = container;
    this.updateHTML();
  }

  setProjects(projects: Project[]): void {
    this.projects = projects;
    this.renderRows();
  }

  private updateHTML(): void {
    if (!this.container) return;

    this.container.innerHTML = `
        <table class="project-table" style="height: calc(100vh - 182px);">
          <thead>
            <tr>
              <th>ICON</th>
              <th>Name</th>
              <th>Created</th>
              <th>Downloads</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="project-table-body">
            <!-- Project rows will be rendered here -->
          </tbody>
        </table>
    `;

    // Header rendered
    // Height managed inline on table; no body inline styles
  }

  private renderRows(): void {
    const tbody = document.getElementById('project-table-body');
    if (!tbody) return;

    // Clear existing rows
    this.projectRows.clear();
    tbody.innerHTML = '';

    // Render new rows
    this.projects.forEach(project => {
      const row = new ProjectRow({
        project,
        projectService: this.props.projectService,
        eventManager: this.props.eventManager,
        onEdit: (proj) => this.handleEditProject(proj),
        onDelete: (proj) => this.handleDeleteProject(proj),
        onDownload: (proj, type) => this.handleDownload(proj, type)
      });

      const rowElement = row.render();
      tbody.appendChild(rowElement);
      this.projectRows.set(project.id, row);
    });

    // Add animation for new rows
    tbody.querySelectorAll('tr').forEach((row, index) => {
      row.style.animation = `slideInDown 0.3s ease ${index * 0.05}s both`;
    });

    // Rows rendered
  }


  private bindEvents(): void {
    this.props.eventManager.on('project:updated', (project: Project) => {
      const row = this.projectRows.get(project.id);
      if (row) {
        row.updateProject(project);
      }
    });

    this.props.eventManager.on('project:deleted', (projectId: string) => {
      const row = this.projectRows.get(projectId);
      if (row) {
        row.animateDelete().then(() => {
          this.projectRows.delete(projectId);
        });
      }
    });
  }

  private async handleEditProject(project: Project): Promise<void> {
    try {
      const { SvgFormModal } = await import('../modals/SvgFormModal.js');
      const modal = new SvgFormModal({
        mode: 'edit',
        project,
        projectService: this.props.projectService,
        eventManager: this.props.eventManager
      });
      
      await modal.show();
    } catch (error) {
      console.error('Failed to show edit modal:', error);
    }
  }

  private async handleDeleteProject(project: Project): Promise<void> {
    try {
      const { DeleteProjectModal } = await import('../modals/DeleteProjectModal.js');
      const modal = new DeleteProjectModal({
        project,
        projectService: this.props.projectService,
        eventManager: this.props.eventManager
      });
      
      const confirmed = await modal.show();
      if (confirmed) {
        await this.props.projectService.delete(project.id);
        this.props.eventManager.emit('project:deleted', project.id);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }

  private async handleDownload(project: Project, packageType: string): Promise<void> {
    try {
      await this.props.projectService.downloadProject(project.id, packageType as any);
    } catch (error) {
      console.error('Failed to download project:', error);
    }
  }

  // No dynamic resizing needed; table height set inline.
}
