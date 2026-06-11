import { CliProject } from '../core/CliProject.js';
export interface ICliRegistry {
    add(project: CliProject): Promise<boolean>;
    remove(key: string): Promise<boolean>;
    get(key: string): CliProject | undefined;
    getAll(): CliProject[];
    has(key: string): boolean;
    reload(key: string): Promise<boolean>;
}
//# sourceMappingURL=ICliRegistry.d.ts.map