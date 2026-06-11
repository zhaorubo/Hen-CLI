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
    add(project: CliProject): Promise<{
        added: boolean;
        globalLinkResult?: 'success' | 'no-package-json' | 'failed';
    }>;
    remove(key: string): Promise<boolean>;
    get(key: string): CliProject | undefined;
    getAll(): CliProject[];
    has(key: string): boolean;
    reload(key: string): Promise<boolean>;
    hasPackageJson(project: CliProject): Promise<boolean>;
    linkToGlobal(project: CliProject): Promise<'success' | 'no-package-json' | 'failed'>;
    unlinkFromGlobal(project: CliProject): Promise<'success' | 'failed'>;
}
//# sourceMappingURL=CliRegistry.d.ts.map