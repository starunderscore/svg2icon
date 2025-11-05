// Settings types for SVG2Icon

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  telemetry: boolean;
  defaultIconType: 'universal' | 'ios' | 'android' | 'desktop' | 'electron' | 'web';
  lastUsedOutputPath?: string;
  windowBounds?: WindowBounds;
  recentProjects?: string[];
  maxRecentProjects?: number;
}

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  maximized?: boolean;
}

export interface ThemeSettings {
  current: 'light' | 'dark' | 'system';
  systemPreference: 'light' | 'dark';
  customColors?: Record<string, string>;
}

export interface TelemetrySettings {
  enabled: boolean;
  userId: string;
  sessionId: string;
  optOutDate?: string;
  dataRetentionDays: number;
}

export interface UpdateSettings {
  autoCheck: boolean;
  autoDownload: boolean;
  allowPrerelease: boolean;
  lastCheckTime?: string;
  skipVersion?: string;
  channel: 'stable' | 'beta' | 'alpha';
}

export interface GenerationSettings {
  defaultIconType: string;
  compressionLevel: number;
  backgroundColor: string;
  padding: number;
  outputFormat: 'png' | 'webp' | 'both';
  retainMetadata: boolean;
}

export interface PrivacySettings {
  analytics: boolean;
  crashReports: boolean;
  usageStats: boolean;
  shareErrorLogs: boolean;
}

// Settings validation schemas
export interface SettingsValidation {
  theme: (value: any) => value is AppSettings['theme'];
  telemetry: (value: any) => value is boolean;
  defaultIconType: (value: any) => value is AppSettings['defaultIconType'];
}

// Settings migration types
export interface SettingsMigration {
  version: string;
  migrate: (oldSettings: any) => AppSettings;
}

export type SettingsKey = keyof AppSettings;
export type SettingsValue<K extends SettingsKey> = AppSettings[K];
