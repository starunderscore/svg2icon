// Main application entry point - SVG2Icon v1.1.0

import { AppHeader } from '../components/layout/AppHeader.js';
import { MainContent } from '../components/layout/MainContent.js';
import { ProjectService } from '../services/ProjectService.js';
import { SettingsService } from '../services/SettingsService.js';
import { TelemetryService } from '../services/TelemetryService.js';
import { EventManager } from '../utils/events.js';
import type { Project } from '../types/Project.js';

declare global {
  interface Window {
    electronAPI: {
      projects: {
        getAll: () => Promise<Project[]>;
        create: (data: any) => Promise<Project>;
        update: (id: string, data: any) => Promise<Project>;
        delete: (id: string) => Promise<boolean>;
        generateIcons: (id: string, type: string) => Promise<any>;
      };
      files: {
        selectSvg: () => Promise<string | null>;
        selectOutputFolder: () => Promise<string | null>;
        downloadProject: (id: string, type: string) => Promise<boolean>;
      };
      settings: {
        get: () => Promise<any>;
        set: (key: string, value: any) => Promise<void>;
        setTheme: (theme: string) => Promise<void>;
      };
      window: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
      };
      app: {
        getVersion: () => Promise<string>;
        checkForUpdates: () => Promise<any>;
      };
      menu: {
        onNewProject: (cb: () => void) => void;
        onOpenSettings: (cb: () => void) => void;
        onCheckUpdates: (cb: () => void) => void;
        onUserManual: (cb: () => void) => void;
        onTechGuide: (cb: () => void) => void;
        onAbout: (cb: () => void) => void;
      };
    };
  }
}

class SVG2IconApp {
  private projectService: ProjectService;
  private settingsService: SettingsService;
  private telemetryService: TelemetryService;
  private eventManager: EventManager;
  private appHeader: AppHeader;
  private mainContent: MainContent;
  private projects: Project[] = [];
  private isInitialized = false;

  constructor() {
    this.eventManager = new EventManager();
    this.projectService = new ProjectService();
    this.settingsService = new SettingsService();
    this.telemetryService = new TelemetryService();
    
    this.appHeader = new AppHeader({
      onNewProject: () => this.handleNewProject(),
      onSettings: () => this.handleSettings(),
      onHelp: () => this.handleHelp()
    });
    
    this.mainContent = new MainContent({
      eventManager: this.eventManager,
      projectService: this.projectService
    });

    this.bindEvents();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Show loading
      this.showLoading('Initializing application...');

      // Initialize services
      await this.settingsService.initialize();
      await this.telemetryService.initialize();

      // Apply theme
      const settings = await this.settingsService.getAll();
      this.applyTheme(settings.theme || 'dark');

      // Load projects
      await this.loadProjects();

      // Render components
      this.render();

      // Track app startup
      this.telemetryService.track('app_initialized', {
        projectCount: this.projects.length,
        theme: settings.theme,
        version: await window.electronAPI.app.getVersion()
      });

      this.isInitialized = true;
      this.hideLoading();

    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application');
      this.hideLoading();
    }
  }

  private bindEvents(): void {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.handleNewProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        this.handleSettings();
      }
    });

    // Project events
    this.eventManager.on('project:created', (project: Project) => {
      this.projects.unshift(project);
      this.mainContent.refreshProjects(this.projects);
      this.showSuccess(`Project "${project.name}" created successfully`);
    });

    this.eventManager.on('project:updated', (project: Project) => {
      const index = this.projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        this.projects[index] = project;
        this.mainContent.refreshProjects(this.projects);
        this.showSuccess(`Project "${project.name}" updated successfully`);
      }
    });

    this.eventManager.on('project:deleted', (projectId: string) => {
      const project = this.projects.find(p => p.id === projectId);
      this.projects = this.projects.filter(p => p.id !== projectId);
      this.mainContent.refreshProjects(this.projects);
      if (project) {
        this.showSuccess(`Project "${project.name}" deleted successfully`);
      }
    });

    this.eventManager.on('project:generation_started', (data: any) => {
      this.showLoading(`Generating ${data.iconType} icons...`);
    });

    this.eventManager.on('project:generation_completed', (data: any) => {
      this.hideLoading();
      this.showSuccess(`Icons generated successfully`);
    });

    this.eventManager.on('project:generation_failed', (data: any) => {
      this.hideLoading();
      this.showError(`Failed to generate icons: ${data.error}`);
    });

    // Settings events
    this.eventManager.on('settings:theme_changed', (theme: string) => {
      this.applyTheme(theme);
    });

    // Download notifications
    this.eventManager.on('download:success', (message: string) => {
      this.showSuccess(message || 'Icons downloaded successfully');
    });
    this.eventManager.on('download:error', (message: string) => {
      this.showError(message || 'Failed to download icons');
    });

    // No content toolbar new-project now; header button handles creation
    
    // Menu events from native menu
    try {
      window.electronAPI.menu.onNewProject(() => this.handleNewProject());
      window.electronAPI.menu.onOpenSettings(() => this.handleSettings());
      window.electronAPI.menu.onCheckUpdates(() => this.handleUpdater());
      window.electronAPI.menu.onUserManual(() => this.handleHelp());
      window.electronAPI.menu.onTechGuide(() => this.handleHelp());
      window.electronAPI.menu.onAbout(() => this.handleAbout());
    } catch {}
  }

  private async loadProjects(): Promise<void> {
    try {
      this.projects = await this.projectService.getAll();
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.projects = [];
    }
  }

  private render(): void {
    const headerContainer = document.getElementById('app-header');
    const mainContainer = document.getElementById('main-content');

    if (headerContainer) {
      this.appHeader.render(headerContainer);
      this.updateProjectCount();
    }

    if (mainContainer) {
      this.mainContent.render(mainContainer);
      this.mainContent.setProjects(this.projects);
    }
  }

  private updateProjectCount(): void { this.appHeader.updateProjectCount(this.projects.length); }

  private async handleNewProject(): Promise<void> {
    try {
      const { SvgFormModal } = await import('../components/modals/SvgFormModal.js');
      const modal = new SvgFormModal({
        mode: 'create',
        projectService: this.projectService,
        eventManager: this.eventManager
      });
      
      const result = await modal.show();
      if (result) {
        // Event handlers will take care of updating the UI
      }
    } catch (error) {
      console.error('Failed to show create project modal:', error);
      this.showError('Failed to open project creation dialog');
    }
  }

  private async handleSettings(): Promise<void> {
    try {
      const { SettingsModal } = await import('../components/modals/SettingsModal.js');
      const modal = new SettingsModal({
        settingsService: this.settingsService,
        eventManager: this.eventManager
      });
      
      await modal.show();
    } catch (error) {
      console.error('Failed to show settings modal:', error);
      this.showError('Failed to open settings dialog');
    }
  }

  private async handleHelp(): Promise<void> {
    try {
      const { HelpModal } = await import('../components/modals/HelpModal.js');
      const modal = new HelpModal();
      await modal.show();
    } catch (error) {
      console.error('Failed to show help modal:', error);
      this.showError('Failed to open help');
    }
  }

  private async handleUpdater(): Promise<void> {
    try {
      const { UpdaterModal } = await import('../components/modals/UpdaterModal.js');
      const modal = new UpdaterModal();
      await modal.show();
    } catch (error) {
      console.error('Failed to show updater modal:', error);
      this.showError('Failed to open updater');
    }
  }

  private async handleAbout(): Promise<void> {
    try {
      const { AboutModal } = await import('../components/modals/AboutModal.js');
      const modal = new AboutModal();
      await modal.show();
    } catch (error) {
      console.error('Failed to show about modal:', error);
      this.showError('Failed to open About');
    }
  }

  private applyTheme(theme: string): void {
    const resolved = theme === 'system'
      ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolved);
    
    // Update theme-color meta tag for better OS integration
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    
    themeColorMeta.content = resolved === 'dark' ? '#0f172a' : '#ffffff';
  }

  private showLoading(message: string = 'Loading...'): void {
    const overlay = document.getElementById('loading-overlay');
    const text = overlay?.querySelector('.loading-text');
    
    if (overlay) {
      overlay.classList.remove('is-hidden');
      if (text) {
        text.textContent = message;
      }
    }
  }

  private hideLoading(): void {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  private showSuccess(message: string): void {
    this.showToast('success', 'Success', message);
  }

  private showError(message: string): void {
    this.showToast('error', 'Error', message);
  }

  private showToast(type: 'success' | 'error' | 'warning', title: string, message: string): void {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠'
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      this.removeToast(toast);
    });

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        this.removeToast(toast);
      }
    }, 5000);
  }

  private removeToast(toast: HTMLElement): void {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const app = new SVG2IconApp();
  await app.initialize();
});

export { SVG2IconApp };
