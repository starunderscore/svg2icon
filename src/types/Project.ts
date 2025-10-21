// Project types for SVG2Icon

export interface Project {
  id: string;
  name: string;
  svgPath: string;
  svgData: string; // Base64 encoded SVG content
  createdAt: string;
  updatedAt: string;
  generatedAt?: string; // Last icon generation time
  outputPath?: string; // Last output directory used
  iconTypes: IconType[];
}

export interface CreateProjectData {
  name: string;
  svgFile: File;
  initialIconTypes?: IconType[];
}

export interface UpdateProjectData {
  name?: string;
  iconTypes?: IconType[];
}

export interface ProjectStats {
  totalProjects: number;
  recentlyCreated: number; // Projects created in last 7 days
  totalGenerations: number;
  lastActivity?: string;
}

export type IconType = 
  | 'universal'
  | 'ios' 
  | 'android'
  | 'desktop'
  | 'electron'
  | 'web';

export interface IconTypeInfo {
  id: IconType;
  name: string;
  description: string;
  features: string[];
  sizes: IconSize[];
}

export interface IconSize {
  name: string;
  size: number;
  scale?: number;
  platform?: string;
}

export interface GenerationResult {
  success: boolean;
  message: string;
  outputPath?: string;
  filesGenerated?: number;
  errors?: string[];
}

export interface DownloadPackage {
  type: 'all' | 'mobile' | 'desktop' | 'web' | 'original';
  projectId: string;
  format: 'zip';
}

// Database schema types
export interface ProjectRow {
  id: string;
  name: string;
  svg_path: string;
  svg_data: string;
  created_at: string;
  updated_at: string;
  generated_at?: string;
  output_path?: string;
  icon_types: string; // JSON stringified array
}

// Event types
export interface ProjectEvent {
  type: 'created' | 'updated' | 'deleted' | 'generated';
  project: Project;
  timestamp: string;
}

export interface ProjectGenerationEvent {
  type: 'generation_started' | 'generation_completed' | 'generation_failed';
  projectId: string;
  iconType: IconType;
  progress?: number;
  error?: string;
  timestamp: string;
}