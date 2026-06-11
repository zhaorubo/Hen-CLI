import { GitInstallOptions } from '../types.js';

export interface IGitInstaller {
  clone(url: string, targetDir: string, options?: GitInstallOptions): Promise<string>;
  validateRepo(url: string): Promise<boolean>;
  getRepoName(url: string): string;
}
