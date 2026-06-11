import fs from 'fs/promises';
import path from 'path';
import { CliProject } from './CliProject.js';
import { IProjectScanner } from '../interfaces/IProjectScanner.js';

export class ProjectScanner implements IProjectScanner {
  async scanDirectory(dir: string): Promise<CliProject[]> {
    const resolved = path.resolve(dir);
    if (await this.isCliProject(resolved)) {
      const project = await this.createProjectFromDir(resolved, 'local');
      return project ? [project] : [];
    }
    return this.findSubProjects(resolved);
  }

  async scanDirectories(dirs: string[]): Promise<CliProject[]> {
    const results = await Promise.all(dirs.map(d => this.scanDirectory(d)));
    return results.flat();
  }

  private async isCliProject(dir: string): Promise<boolean> {
    try {
      const entry = path.join(dir, 'index.ts');
      await fs.access(entry);
      return true;
    } catch {
      return false;
    }
  }

  private async findSubProjects(dir: string): Promise<CliProject[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const projects: CliProject[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const subPath = path.join(dir, entry.name);
          if (await this.isCliProject(subPath)) {
            const project = await this.createProjectFromDir(subPath, 'local');
            if (project) projects.push(project);
          }
        }
      }
      return projects;
    } catch {
      return [];
    }
  }

  private async createProjectFromDir(dir: string, source: 'local' | 'git'): Promise<CliProject | null> {
    try {
      const entryPath = path.join(dir, 'index.ts');
      const content = await fs.readFile(entryPath, 'utf-8');

      const keyMatch = content.match(/cliMeta[\s\S]*?key[:\s]+['"]([^'"]+)['"]/);
      const nameMatch = content.match(/cliMeta[\s\S]*?name[:\s]+['"]([^'"]+)['"]/);

      const key = keyMatch ? keyMatch[1] : path.basename(dir);
      const name = nameMatch ? nameMatch[1] : path.basename(dir);

      return new CliProject(key, name, dir, source);
    } catch {
      return null;
    }
  }
}
