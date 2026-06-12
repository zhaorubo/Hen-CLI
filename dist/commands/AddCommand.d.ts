import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { ProjectScanner } from '../core/ProjectScanner.js';
import { GitInstaller } from '../core/GitInstaller.js';
import { ConfigManager } from '../core/ConfigManager.js';
export declare class AddCommand extends BaseCommand {
    private readonly _scanner;
    private readonly _gitInstaller;
    private readonly _configManager;
    constructor(registry: any, scanner: ProjectScanner, gitInstaller: GitInstaller, configManager: ConfigManager);
    get name(): string;
    get description(): string;
    createCommand(): Command;
    private interactiveAdd;
    private getGlobalLinkSuffix;
    private copyDir;
    private addLocalProject;
    private addGitProject;
}
//# sourceMappingURL=AddCommand.d.ts.map