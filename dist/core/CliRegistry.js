import { CliProject } from './CliProject.js';
export class CliRegistry {
    _configManager;
    _scanner;
    _loader;
    _projects = new Map();
    constructor(configManager, scanner, loader) {
        this._configManager = configManager;
        this._scanner = scanner;
        this._loader = loader;
    }
    async initialize() {
        // Load projects from config
        for (const data of this._configManager.projects) {
            const project = CliProject.fromSerialized(data);
            this._projects.set(project.key, project);
        }
        // Load projects from scan dirs
        for (const dir of this._configManager.scanDirs) {
            try {
                const projects = await this._scanner.scanDirectory(dir);
                for (const project of projects) {
                    if (!this._projects.has(project.key)) {
                        this._projects.set(project.key, project);
                    }
                }
            }
            catch {
                // Skip invalid scan dirs
            }
        }
        // Load modules for all projects
        for (const project of this._projects.values()) {
            try {
                await this._loader.load(project);
            }
            catch {
                // Some projects may not have valid modules, skip them
            }
        }
    }
    async add(project) {
        if (this._projects.has(project.key)) {
            return false;
        }
        try {
            await this._loader.load(project);
        }
        catch {
            // Module may not be valid, add anyway
        }
        this._projects.set(project.key, project);
        await this._configManager.addProject(project.serialize());
        return true;
    }
    async remove(key) {
        const project = this._projects.get(key);
        if (!project) {
            return false;
        }
        await this._loader.unload(key);
        this._projects.delete(key);
        await this._configManager.removeProject(key);
        return true;
    }
    get(key) {
        return this._projects.get(key);
    }
    getAll() {
        return Array.from(this._projects.values());
    }
    has(key) {
        return this._projects.has(key);
    }
    async reload(key) {
        const project = this._projects.get(key);
        if (!project) {
            return false;
        }
        try {
            await this._loader.reload(project);
            return true;
        }
        catch {
            return false;
        }
    }
}
//# sourceMappingURL=CliRegistry.js.map