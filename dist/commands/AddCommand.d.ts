import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { ProjectScanner } from '../core/ProjectScanner.js';
import { GitInstaller } from '../core/GitInstaller.js';
export declare class AddCommand extends BaseCommand {
    private readonly _scanner;
    private readonly _gitInstaller;
    constructor(registry: any, scanner: ProjectScanner, gitInstaller: GitInstaller);
    get name(): string;
    get description(): string;
    createCommand(): Command;
    private interactiveAdd;
    private addLocalProject;
    private addGitProject;
}
//# sourceMappingURL=AddCommand.d.ts.map