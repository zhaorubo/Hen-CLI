import fs from 'fs/promises';
import path from 'path';
import os from 'os';
const DEFAULT_AI_CONFIG = {
    apiKey: '0cd3e5f6c58f4cab936f27179b657f46.dDoiKNZCDNzDH1vU',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
    model: 'GLM-4.7-Flash',
    maxTokens: 4096,
    temperature: 0.7,
};
const DEFAULT_REGISTRY = {
    projects: [],
    scanDirs: [],
    projectsDir: path.join(os.homedir(), '.hen', 'projects'),
    ai: DEFAULT_AI_CONFIG,
};
export class ConfigManager {
    _configPath;
    _registry;
    constructor(configPath) {
        this._configPath = configPath || path.join(os.homedir(), '.hen', 'registry.json');
        this._registry = DEFAULT_REGISTRY;
    }
    get scanDirs() {
        return this._registry.scanDirs;
    }
    get projectsDir() {
        return this._registry.projectsDir || DEFAULT_REGISTRY.projectsDir;
    }
    get projects() {
        return this._registry.projects;
    }
    get aiConfig() {
        return { ...this._registry.ai };
    }
    async init() {
        try {
            const content = await fs.readFile(this._configPath, 'utf-8');
            this._registry = JSON.parse(content);
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
        }
        catch {
            await this.save();
        }
    }
    async addScanDir(dir) {
        const resolved = path.resolve(dir);
        if (!this._registry.scanDirs.includes(resolved)) {
            this._registry.scanDirs.push(resolved);
            await this.save();
        }
    }
    async addProject(project) {
        this._registry.projects = this._registry.projects.filter(p => p.key !== project.key);
        this._registry.projects.push(project);
        project.installed = true;
        await this.save();
    }
    async removeProject(key) {
        this._registry.projects = this._registry.projects.filter(p => {
            if (p.key === key) {
                p.installed = false;
            }
            return p.key !== key;
        });
        await this.save();
    }
    async updateProject(project) {
        const idx = this._registry.projects.findIndex(p => p.key === project.key);
        if (idx >= 0) {
            this._registry.projects[idx] = project;
            await this.save();
        }
    }
    async updateAiConfig(config) {
        this._registry.ai = { ...this._registry.ai, ...config };
        await this.save();
    }
    async save() {
        const dir = path.dirname(this._configPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this._configPath, JSON.stringify(this._registry, null, 2), 'utf-8');
    }
    async reload() {
        await this.init();
    }
}
//# sourceMappingURL=ConfigManager.js.map