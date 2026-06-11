import { CliMetaInfo } from '../types.js';
import { Command } from 'commander';
export interface ICliModule {
    readonly meta: CliMetaInfo;
    register(command: Command): void;
    dispose?(): void;
}
//# sourceMappingURL=ICliModule.d.ts.map