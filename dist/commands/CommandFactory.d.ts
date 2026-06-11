import { BaseCommand } from './BaseCommand.js';
import { ICliRegistry } from '../interfaces/ICliRegistry.js';
import { ProjectScanner } from '../core/ProjectScanner.js';
import { ModuleLoader } from '../core/ModuleLoader.js';
import { GitInstaller } from '../core/GitInstaller.js';
import { OpenAIService } from '../core/OpenAIService.js';
import { ConfigManager } from '../core/ConfigManager.js';
export declare class CommandFactory {
    static createAllCommands(registry: ICliRegistry, scanner: ProjectScanner, loader: ModuleLoader, configManager: ConfigManager, gitInstaller: GitInstaller, aiService: OpenAIService): BaseCommand[];
}
//# sourceMappingURL=CommandFactory.d.ts.map