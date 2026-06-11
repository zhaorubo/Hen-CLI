import { CliProject } from './CliProject.js';
import { ICliModule } from '../interfaces/ICliModule.js';
import { IModuleLoader } from '../interfaces/IModuleLoader.js';
import path from 'path';
import { pathToFileURL } from 'url';
import { Command } from 'commander';

export class ModuleLoader implements IModuleLoader {
  private readonly _loadedModules = new Map<string, ICliModule>();

  async load(project: CliProject): Promise<ICliModule> {
    const entryPath = pathToFileURL(project.entryPath).href;
    
    const module = await import(`${entryPath}?t=${Date.now()}`);
    const cliModule = this.validateModule(module);
    
    project.setModule(cliModule);
    this._loadedModules.set(project.key, cliModule);
    return cliModule;
  }

  async unload(key: string): Promise<void> {
    this._loadedModules.delete(key);
  }

  async reload(project: CliProject): Promise<ICliModule> {
    await this.unload(project.key);
    project.clearModule();
    return this.load(project);
  }

  private validateModule(module: unknown): ICliModule {
    const mod = module as Record<string, unknown>;
    
    if (!mod.cliMeta || !mod.register) {
      throw new Error(
        `CLI module must export 'cliMeta' (key, name) and 'register' function`
      );
    }

    const cliMeta = mod.cliMeta as { key: string; name: string; version?: string; description?: string };
    
    return {
      meta: cliMeta,
      register: mod.register as (command: Command) => void,
      dispose: typeof mod.dispose === 'function' ? mod.dispose as () => void : undefined,
    };
  }
}
