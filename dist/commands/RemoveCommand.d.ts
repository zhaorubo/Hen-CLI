import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { ConfigManager } from '../core/ConfigManager.js';
export declare class RemoveCommand extends BaseCommand {
    private readonly _configManager;
    constructor(registry: any, configManager: ConfigManager);
    get name(): string;
    get description(): string;
    createCommand(): Command;
    private handleRemove;
}
//# sourceMappingURL=RemoveCommand.d.ts.map