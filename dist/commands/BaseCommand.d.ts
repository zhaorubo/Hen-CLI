import { Command } from 'commander';
import { ICliRegistry } from '../interfaces/ICliRegistry.js';
export declare abstract class BaseCommand {
    protected readonly _registry: ICliRegistry;
    constructor(registry: ICliRegistry);
    abstract get name(): string;
    abstract get description(): string;
    abstract createCommand(): Command;
}
//# sourceMappingURL=BaseCommand.d.ts.map