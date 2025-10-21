// UI component types for SVG2Icon

import type { Project, IconType } from './Project.js';
import type { ProjectService } from '../services/ProjectService.js';
import type { EventManager } from '../utils/events.js';

// Base component interfaces
export interface BaseComponentProps {
  className?: string;
  style?: Record<string, string>;
  testId?: string;
  ariaLabel?: string;
}

// Header component types
export interface AppHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  projectCount?: number;
  onNewProject: () => void;
  onSettings: () => void;
}

// Content component types
export interface MainContentProps extends BaseComponentProps {
  eventManager: EventManager;
  projectService: ProjectService;
}

// Table component types
export interface ProjectTableProps extends BaseComponentProps {
  eventManager: EventManager;
  projectService: ProjectService;
  projects?: Project[];
  sortBy?: 'name' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  onProjectSelect?: (project: Project) => void;
}

export interface ProjectRowProps extends BaseComponentProps {
  project: Project;
  projectService: ProjectService;
  eventManager: EventManager;
  isSelected?: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDownload: (project: Project, type: string) => void;
  onSelect?: (project: Project, selected: boolean) => void;
}

export interface ProjectActionsProps extends BaseComponentProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onGenerate: (iconType: IconType) => void;
  onDuplicate?: (project: Project) => void;
  onExport?: (project: Project) => void;
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  title: string;
  size?: 'small' | 'medium' | 'large' | 'fullwidth';
  showClose?: boolean;
  onClose?: () => void;
}

export interface CreateProjectModalProps extends ModalProps {
  projectService: ProjectService;
  eventManager: EventManager;
}

export interface EditProjectModalProps extends ModalProps {
  project: Project;
  projectService: ProjectService;
  eventManager: EventManager;
}

export interface DeleteProjectModalProps extends ModalProps {
  project: Project;
  projectService: ProjectService;
  eventManager: EventManager;
}

export interface SettingsModalProps extends ModalProps {
  settingsService: any;
  eventManager: EventManager;
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'text' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  onClick?: (event: MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  help?: string;
  error?: string;
  required?: boolean;
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface SelectProps extends FormFieldProps {
  value?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  onChange?: (value: string) => void;
}

export interface CheckboxProps extends FormFieldProps {
  checked?: boolean;
  value?: string;
  onChange?: (checked: boolean) => void;
}

export interface FileUploadProps extends FormFieldProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFileSelect?: (files: FileList) => void;
  onError?: (error: string) => void;
}

// Toast/Notification types
export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
}

// Loading/Progress types
export interface LoadingProps extends BaseComponentProps {
  message?: string;
  progress?: number;
  cancellable?: boolean;
  onCancel?: () => void;
}

// Dropdown/Menu types
export interface DropdownProps extends BaseComponentProps {
  trigger: HTMLElement;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  onItemClick?: (item: DropdownItem) => void;
}

export interface DropdownItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  children?: DropdownItem[];
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    default: string;
    light: string;
    focus: string;
  };
}

// Animation types
export interface AnimationProps {
  duration?: number;
  delay?: number;
  easing?: string;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// Layout types
export interface LayoutProps extends BaseComponentProps {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: number | string;
  wrap?: boolean;
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Service bundle for dependency injection
export interface ServiceBundle {
  projectService: ProjectService;
  eventManager: EventManager;
  [key: string]: any;
}