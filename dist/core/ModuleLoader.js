import { pathToFileURL } from 'url';
export class ModuleLoader {
    _loadedModules = new Map();
    async load(project) {
        const entryPath = pathToFileURL(project.entryPath).href;
        const module = await import(`${entryPath}?t=${Date.now()}`);
        const cliModule = this.validateModule(module);
        project.setModule(cliModule);
        this._loadedModules.set(project.key, cliModule);
        return cliModule;
    }
    async unload(key) {
        this._loadedModules.delete(key);
    }
    async reload(project) {
        await this.unload(project.key);
        project.clearModule();
        return this.load(project);
    }
    validateModule(module) {
        const mod = module;
        if (!mod.cliMeta || !mod.register) {
            throw new Error(`CLI module must export 'cliMeta' (key, name) and 'register' function`);
        }
        const cliMeta = mod.cliMeta;
        return {
            meta: cliMeta,
            register: mod.register,
            dispose: typeof mod.dispose === 'function' ? mod.dispose : undefined,
        };
    }
}
//# sourceMappingURL=ModuleLoader.js.map