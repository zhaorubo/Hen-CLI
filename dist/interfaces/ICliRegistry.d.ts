import { CliProject } from '../core/CliProject.js';
export type GlobalLinkResult = 'success' | 'no-package-json' | 'failed';
export interface ICliRegistry {
    add(project: CliProject): Promise<{
        added: boolean;
        globalLinkResult?: GlobalLinkResult;
    }>;
    remove(key: string): Promise<boolean>;
    get(key: string): CliProject | undefined;
    getAll(): CliProject[];
    has(key: string): boolean;
    reload(key: string): Promise<boolean>;
    hasPackageJson(project: CliProject): Promise<boolean>;
    linkToGlobal(project: CliProject): Promise<GlobalLinkResult>;
    unlinkFromGlobal(project: CliProject): Promise<'success' | 'failed'>;
}
//# sourceMappingURL=ICliRegistry.d.ts.map