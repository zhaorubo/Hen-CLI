import { IGitInstaller } from '../interfaces/IGitInstaller.js';
import { GitInstallOptions } from '../types.js';
export declare class GitInstaller implements IGitInstaller {
    private _git;
    constructor();
    clone(url: string, targetDir: string, options?: GitInstallOptions): Promise<string>;
    validateRepo(url: string): Promise<boolean>;
    getRepoName(url: string): string;
    private parseGitUrl;
}
//# sourceMappingURL=GitInstaller.d.ts.map