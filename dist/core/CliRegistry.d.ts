import { CliProject } from './CliProject.js';
import { ConfigManager } from './ConfigManager.js';
import { IProjectScanner } from '../interfaces/IProjectScanner.js';
import { IModuleLoader } from '../interfaces/IModuleLoader.js';
import { ICliRegistry } from '../interfaces/ICliRegistry.js';
export declare class CliRegistry implements ICliRegistry {
    private readonly _configManager;
    private readonly _scanner;
    private readonly _loader;
    private readonly _projects;
    constructor(configManager: ConfigManager, scanner: IProjectScanner, loader: IModuleLoader);
    initialize(): Promise<void>;
    add(project: CliProject): Promise<boolean>;
    remove(key: string): Promise<boolean>;
    get(key: string): CliProject | undefined;
    getAll(): CliProject[];
    has(key: string): boolean;
    reload(key: string): Promise<boolean>;
    linkToGlobal(project: CliProject): Promise<void>;
    unlinkFromGlobal(project: CliProject): Promise<void>;
}
//# sourceMappingURL=CliRegistry.d.ts.map