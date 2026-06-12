export interface CliMetaInfo {
  key: string;
  name: string;
  version?: string;
  description?: string;
}

export interface RegistryData {
  projects: SerializedProject[];
  scanDirs: string[];
  projectsDir: string;
  ai: AiConfig;
}

export interface SerializedProject {
  key: string;
  name: string;
  path: string;
  version?: string;
  description?: string;
  source: 'local' | 'git';
  gitUrl?: string;
  globalLink?: boolean;
  installed?: boolean;
}

export type ProjectSource = 'local' | 'git';

export interface GitInstallOptions {
  branch?: string;
  shallow?: boolean;
}

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
