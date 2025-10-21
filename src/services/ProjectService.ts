// ProjectService - CRUD operations for SVG projects

import type { Project, CreateProjectData, UpdateProjectData, IconType, GenerationResult } from '../types/Project.js';

export class ProjectService {
  private cache: Project[] | null = null;

  async getAll(): Promise<Project[]> {
    try {
      if (this.cache) {
        return this.cache;
      }

      const projects = await window.electronAPI.projects.getAll();
      this.cache = projects;
      return projects;
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Project | null> {
    try {
      const projects = await this.getAll();
      return projects.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Failed to get project by id:', error);
      return null;
    }
  }

  async create(data: CreateProjectData): Promise<Project> {
    try {
      // Validate SVG file
      if (!this.isValidSvgFile(data.svgFile)) {
        throw new Error('Invalid SVG file. Please select a valid SVG file.');
      }

      // Read file as base64
      const svgData = await this.fileToBase64(data.svgFile);
      
      const projectData = {
        name: this.sanitizeProjectName(data.name),
        svgData,
        iconTypes: data.initialIconTypes || ['universal']
      };

      const project = await window.electronAPI.projects.create(projectData);
      
      // Clear cache to force refresh
      this.cache = null;
      
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create project');
    }
  }

  async update(id: string, data: UpdateProjectData): Promise<Project> {
    try {
      const updateData: any = {};
      
      if (data.name !== undefined) {
        updateData.name = this.sanitizeProjectName(data.name);
      }
      
      if (data.iconTypes !== undefined) {
        updateData.iconTypes = data.iconTypes;
      }

      const project = await window.electronAPI.projects.update(id, updateData);
      
      // Update cache if it exists
      if (this.cache) {
        const index = this.cache.findIndex(p => p.id === id);
        if (index !== -1) {
          this.cache[index] = project;
        }
      }
      
      return project;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update project');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const success = await window.electronAPI.projects.delete(id);
      
      // Remove from cache if it exists
      if (this.cache && success) {
        this.cache = this.cache.filter(p => p.id !== id);
      }
      
      return success;
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete project');
    }
  }

  async generateIcons(id: string, iconType: IconType): Promise<GenerationResult> {
    try {
      const result = await window.electronAPI.projects.generateIcons(id, iconType);
      
      // Update the project's generated timestamp in cache
      if (this.cache) {
        const project = this.cache.find(p => p.id === id);
        if (project) {
          project.generatedAt = new Date().toISOString();
          project.iconTypes = [...new Set([...project.iconTypes, iconType])];
        }
      }
      
      return result;
    } catch (error) {
      console.error('Failed to generate icons:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate icons');
    }
  }

  async downloadProject(id: string, packageType: 'all' | 'mobile' | 'desktop' | 'web' | 'original'): Promise<boolean> {
    try {
      return await window.electronAPI.files.downloadProject(id, packageType);
    } catch (error) {
      console.error('Failed to download project:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to download project');
    }
  }

  // Utility methods
  private isValidSvgFile(file: File): boolean {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.svg')) {
      return false;
    }

    // Check MIME type
    if (file.type && !file.type.includes('svg')) {
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return false;
    }

    return true;
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix to get just the base64 data
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private sanitizeProjectName(name: string): string {
    // Remove dangerous characters and limit length
    return name
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .substring(0, 100);
  }

  // Cache management
  clearCache(): void {
    this.cache = null;
  }

  refreshCache(): Promise<Project[]> {
    this.cache = null;
    return this.getAll();
  }

  // Statistics
  async getStats(): Promise<{
    total: number;
    recentlyCreated: number;
    recentlyGenerated: number;
    mostUsedIconType: IconType | null;
  }> {
    try {
      const projects = await this.getAll();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recentlyCreated = projects.filter(p => 
        new Date(p.createdAt) > weekAgo
      ).length;

      const recentlyGenerated = projects.filter(p => 
        p.generatedAt && new Date(p.generatedAt) > weekAgo
      ).length;

      // Count icon type usage
      const iconTypeCounts: Record<string, number> = {};
      projects.forEach(p => {
        p.iconTypes.forEach(type => {
          iconTypeCounts[type] = (iconTypeCounts[type] || 0) + 1;
        });
      });

      const mostUsedIconType = Object.keys(iconTypeCounts).length > 0
        ? Object.keys(iconTypeCounts).reduce((a, b) => 
            iconTypeCounts[a] > iconTypeCounts[b] ? a : b
          ) as IconType
        : null;

      return {
        total: projects.length,
        recentlyCreated,
        recentlyGenerated,
        mostUsedIconType
      };
    } catch (error) {
      console.error('Failed to get project stats:', error);
      return {
        total: 0,
        recentlyCreated: 0,
        recentlyGenerated: 0,
        mostUsedIconType: null
      };
    }
  }

  // Format helpers
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
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
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    
    return date.toLocaleDateString();
  }

  getIconTypeInfo(type: IconType): { name: string; description: string; badge: string } {
    const iconTypeMap = {
      universal: {
        name: 'Universal',
        description: 'Complete cross-platform package',
        badge: '🌐'
      },
      ios: {
        name: 'iOS',
        description: 'iOS App Store ready',
        badge: '📱'
      },
      android: {
        name: 'Android',
        description: 'Google Play Store ready',
        badge: '🤖'
      },
      desktop: {
        name: 'Desktop',
        description: 'Windows, macOS, Linux',
        badge: '🖥️'
      },
      electron: {
        name: 'Electron',
        description: 'Electron app ready',
        badge: '⚡'
      },
      web: {
        name: 'Web',
        description: 'PWA and web ready',
        badge: '🌍'
      }
    };

    return iconTypeMap[type] || iconTypeMap.universal;
  }
}