import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { AiConfig, RegistryData, SerializedProject } from '../types.js';

const DEFAULT_AI_CONFIG: AiConfig = {
  apiKey: '0cd3e5f6c58f4cab936f27179b657f46.dDoiKNZCDNzDH1vU',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
  model: 'GLM-4.7-Flash',
  maxTokens: 4096,
  temperature: 0.7,
};

const DEFAULT_REGISTRY: RegistryData = {
  projects: [],
  scanDirs: [],
  projectsDir: path.join(os.homedir(), '.hen', 'projects'),
  ai: DEFAULT_AI_CONFIG,
};

export class ConfigManager {
  private readonly _configPath: string;
  private _registry: RegistryData;

  constructor(configPath?: string) {
    this._configPath = configPath || path.join(os.homedir(), '.hen', 'registry.json');
    this._registry = DEFAULT_REGISTRY;
  }

  get scanDirs(): readonly string[] {
    return this._registry.scanDirs;
  }

  get projectsDir(): string {
    return this._registry.projectsDir || DEFAULT_REGISTRY.projectsDir;
  }

  get projects(): readonly SerializedProject[] {
    return this._registry.projects;
  }

  get aiConfig(): AiConfig {
    return { ...this._registry.ai };
  }

  async init(): Promise<void> {
    try {
      const content = await fs.readFile(this._configPath, 'utf-8');
      this._registry = JSON.parse(content) as RegistryData;
      // Ensure ai config exists
      if (!this._registry.ai) {
        this._registry.ai = { ...DEFAULT_AI_CONFIG };
        await this.save();
      }
      // Ensure projectsDir exists
      if (!this._registry.projectsDir) {
        this._registry.projectsDir = DEFAULT_REGISTRY.projectsDir;
        await this.save();
      }
    } catch {
      await this.save();
    }
  }

  async addScanDir(dir: string): Promise<void> {
    const resolved = path.resolve(dir);
    if (!this._registry.scanDirs.includes(resolved)) {
      this._registry.scanDirs.push(resolved);
      await this.save();
    }
  }

  async addProject(project: SerializedProject): Promise<void> {
    this._registry.projects = this._registry.projects.filter(p => p.key !== project.key);
    this._registry.projects.push(project);
    project.installed = true;
    await this.save();
  }

  async removeProject(key: string): Promise<void> {
    this._registry.projects = this._registry.projects.filter(p => {
      if (p.key === key) {
        p.installed = false;
      }
      return p.key !== key;
    });
    await this.save();
  }

  async updateProject(project: SerializedProject): Promise<void> {
    const idx = this._registry.projects.findIndex(p => p.key === project.key);
    if (idx >= 0) {
      this._registry.projects[idx] = project;
      await this.save();
    }
  }

  async updateAiConfig(config: Partial<AiConfig>): Promise<void> {
    this._registry.ai = { ...this._registry.ai, ...config };
    await this.save();
  }

  async save(): Promise<void> {
    const dir = path.dirname(this._configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this._configPath, JSON.stringify(this._registry, null, 2), 'utf-8');
  }

  async reload(): Promise<void> {
    await this.init();
  }
}
