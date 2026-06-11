import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
export declare class ReloadCommand extends BaseCommand {
    get name(): string;
    get description(): string;
    createCommand(): Command;
    private handleReload;
}
//# sourceMappingURL=ReloadCommand.d.ts.map