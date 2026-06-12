import { CliProject } from './CliProject.js';
import { ConfigManager } from './ConfigManager.js';
import { IProjectScanner } from '../interfaces/IProjectScanner.js';
import { IModuleLoader } from '../interfaces/IModuleLoader.js';
import { ICliRegistry } from '../interfaces/ICliRegistry.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import * as clack from '@clack/prompts';

const execAsync = promisify(exec);

export class CliRegistry implements ICliRegistry {
  private readonly _configManager: ConfigManager;
  private readonly _scanner: IProjectScanner;
  private readonly _loader: IModuleLoader;
  private readonly _projects = new Map<string, CliProject>();

  constructor(
    configManager: ConfigManager,
    scanner: IProjectScanner,
    loader: IModuleLoader
  ) {
    this._configManager = configManager;
    this._scanner = scanner;
    this._loader = loader;
  }

  async initialize(): Promise<void> {
    // Load projects from config
    for (const data of this._configManager.projects) {
      const project = CliProject.fromSerialized(data);
      this._projects.set(project.key, project);
    }

    // Load projects from scan dirs
    for (const dir of this._configManager.scanDirs) {
      try {
        const projects = await this._scanner.scanDirectory(dir);
        for (const project of projects) {
          if (!this._projects.has(project.key)) {
            this._projects.set(project.key, project);
          }
        }
      } catch {
        // Skip invalid scan dirs
      }
    }

    // Load projects from projects dir
    try {
      const projectsDir = this._configManager.projectsDir;
      const projectsFromDir = await this._scanner.scanDirectory(projectsDir);
      for (const project of projectsFromDir) {
        if (!this._projects.has(project.key)) {
          // Check installed status for projects
          const installed = await this.isInstalled(project);
          const projectWithInstalled = new CliProject(
            project.key,
            project.name,
            project.path,
            project.source,
            project.version,
            project.description,
            project.gitUrl,
            project.globalLink,
            installed
          );
          this._projects.set(project.key, projectWithInstalled);
        }
      }
    } catch {
      // Projects dir may not exist yet
    }

    // Load modules for all projects
    for (const project of this._projects.values()) {
      try {
        await this._loader.load(project);
      } catch {
        // Some projects may not have valid modules, skip them
      }
    }
  }

  private async isInstalled(project: CliProject): Promise<boolean> {
    try {
      // Try to get the actual package name from package.json
      let pkgName = project.name;
      try {
        const pkgPath = path.join(project.path, 'package.json');
        const content = await fs.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(content) as { name?: string };
        if (pkg.name) pkgName = pkg.name;
      } catch {
        // Fall back to project.name
      }

      const { stdout } = await execAsync(`npm list -g --depth=0 ${pkgName}`);
      return stdout.includes(pkgName);
    } catch {
      return false;
    }
  }

  async add(project: CliProject): Promise<{ added: boolean; globalLinkResult?: 'success' | 'no-package-json' | 'failed' }> {
    if (this._projects.has(project.key)) {
      return { added: false };
    }

    try {
      await this._loader.load(project);
    } catch {
      // Module may not be valid, add anyway
    }

    this._projects.set(project.key, project);
    await this._configManager.addProject(project.serialize());

    let globalLinkResult: 'success' | 'no-package-json' | 'failed' | undefined;
    if (project.globalLink) {
      globalLinkResult = await this.linkToGlobal(project);
    }

    return { added: true, globalLinkResult };
  }

  async remove(key: string): Promise<boolean> {
    const project = this._projects.get(key);
    if (!project) {
      return false;
    }

    await this._loader.unload(key);
    this._projects.delete(key);
    await this._configManager.removeProject(key);
    return true;
  }

  get(key: string): CliProject | undefined {
    return this._projects.get(key);
  }

  getAll(): CliProject[] {
    return Array.from(this._projects.values());
  }

  has(key: string): boolean {
    return this._projects.has(key);
  }

  async reload(key: string): Promise<boolean> {
    const project = this._projects.get(key);
    if (!project) {
      return false;
    }

    try {
      await this._loader.reload(project);
      return true;
    } catch {
      return false;
    }
  }

  async hasPackageJson(project: CliProject): Promise<boolean> {
    try {
      await fs.access(path.join(project.path, 'package.json'));
      return true;
    } catch {
      return false;
    }
  }

  async linkToGlobal(project: CliProject): Promise<'success' | 'no-package-json' | 'failed'> {
    const hasPkgJson = await this.hasPackageJson(project);
    if (!hasPkgJson) {
      return 'no-package-json';
    }

    const spinner = clack.spinner();
    spinner.start(`正在编译项目 ${project.name}...`);
    try {
      // Install dependencies first
      await execAsync('npm install', { cwd: project.path });
      // Build if there's a build script
      try {
        await execAsync('npm run build', { cwd: project.path });
      } catch {
        // No build script or build failed, continue anyway
      }
      // Link globally
      await execAsync('npm link', { cwd: project.path });
      spinner.stop();
      return 'success';
    } catch {
      spinner.stop();
      clack.outro('编译项目失败');
      return 'failed';
    }
  }

  async unlinkFromGlobal(project: CliProject): Promise<'success' | 'failed'> {
    try {
      await execAsync(`npm unlink -g ${project.name}`, { cwd: project.path });
      return 'success';
    } catch {
      return 'failed';
    }
  }
}
