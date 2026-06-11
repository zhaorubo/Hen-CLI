import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
export declare class RemoveCommand extends BaseCommand {
    get name(): string;
    get description(): string;
    createCommand(): Command;
    private handleRemove;
}
//# sourceMappingURL=RemoveCommand.d.ts.map