import { CliProject } from './CliProject.js';
import { ICliModule } from '../interfaces/ICliModule.js';
import { IModuleLoader } from '../interfaces/IModuleLoader.js';
export declare class ModuleLoader implements IModuleLoader {
    private readonly _loadedModules;
    load(project: CliProject): Promise<ICliModule>;
    unload(key: string): Promise<void>;
    reload(project: CliProject): Promise<ICliModule>;
    private validateModule;
}
//# sourceMappingURL=ModuleLoader.d.ts.map