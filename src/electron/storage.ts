// JSON-only storage service for a simple dev app
import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import type { Project } from '../types/Project.js';

export class StorageService {
  private jsonPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.jsonPath = path.join(userDataPath, 'svg2icon.json');
    fs.mkdirSync(path.dirname(this.jsonPath), { recursive: true });
    if (!fs.existsSync(this.jsonPath)) {
      fs.writeFileSync(this.jsonPath, JSON.stringify({ projects: [], settings: {
        theme: 'dark', telemetry: true, autoUpdate: false, defaultIconType: 'universal'
      } }, null, 2));
    }
  }

  // ---------- Project operations ----------
  async getAllProjects(): Promise<Project[]> {
    const state = this.readJson();
    return (state.projects as Project[]).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const state = this.readJson();
    return (state.projects as Project[]).find(p => p.id === id) || null;
  }

  async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
    const id = this.generateId();
    const project: Project = { ...projectData, id };
    const state = this.readJson();
    state.projects.push(project);
    this.writeJson(state);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const state = this.readJson();
    const idx = state.projects.findIndex((p: Project) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    const updated = { ...state.projects[idx], ...updates, id } as Project;
    state.projects[idx] = updated;
    this.writeJson(state);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const state = this.readJson();
    const before = state.projects.length;
    state.projects = state.projects.filter((p: Project) => p.id !== id);
    this.writeJson(state);
    return state.projects.length < before;
  }

  // ---------- Settings operations ----------
  async getSettings(): Promise<Record<string, any>> {
    const state = this.readJson();
    return state.settings || {};
  }

  async getSetting(key: string): Promise<any> {
    const state = this.readJson();
    return state.settings?.[key];
  }

  async setSetting(key: string, value: any): Promise<void> {
    const state = this.readJson();
    state.settings = state.settings || {};
    state.settings[key] = value;
    this.writeJson(state);
  }

  // ---------- JSON helpers ----------
  private readJson(): { projects: Project[]; settings: Record<string, any> } {
    try {
      const txt = fs.readFileSync(this.jsonPath, 'utf-8');
      const data = JSON.parse(txt);
      return { projects: data.projects || [], settings: data.settings || {} };
    } catch {
      return { projects: [], settings: {} };
    }
  }

  private writeJson(data: { projects: Project[]; settings: Record<string, any> }): void {
    fs.writeFileSync(this.jsonPath, JSON.stringify(data, null, 2));
  }

  // ---------- Utils ----------
  private generateId(): string {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  }

  close(): void {
    // No-op for JSON store
  }
}
