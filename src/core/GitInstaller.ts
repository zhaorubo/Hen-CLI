import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { IGitInstaller } from '../interfaces/IGitInstaller.js';
import { GitInstallOptions } from '../types.js';

export class GitInstaller implements IGitInstaller {
  private _git: SimpleGit;

  constructor() {
    this._git = simpleGit();
  }

  async clone(url: string, targetDir: string, options?: GitInstallOptions): Promise<string> {
    await fs.mkdir(targetDir, { recursive: true });

    const cloneOptions: string[] = [];
    if (options?.shallow) {
      cloneOptions.push('--depth', '1');
    }

    const repoName = this.getRepoName(url);
    const cloneTarget = path.join(targetDir, repoName);

    await this._git.clone(url, cloneTarget, cloneOptions);

    if (options?.branch) {
      const git = simpleGit(cloneTarget);
      await git.checkout(options.branch);
    }

    return cloneTarget;
  }

  async validateRepo(url: string): Promise<boolean> {
    try {
      await this._git.listRemote(['--get-url', url]);
      return true;
    } catch {
      return url.startsWith('http') || url.startsWith('git@');
    }
  }

  getRepoName(url: string): string {
    const parsed = this.parseGitUrl(url);
    return parsed.repo;
  }

  private parseGitUrl(url: string): { owner: string; repo: string } {
    let cleaned = url.replace(/\.git$/, '');
    
    if (cleaned.startsWith('git@')) {
      const parts = cleaned.split(':')[1]?.split('/');
      if (parts && parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    
    if (cleaned.startsWith('http')) {
      const parts = new URL(cleaned).pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
    
    const segments = cleaned.split('/').filter(Boolean);
    return { owner: '', repo: segments[segments.length - 1] || 'unknown' };
  }
}
