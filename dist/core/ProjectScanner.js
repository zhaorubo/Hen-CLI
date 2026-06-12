import fs from 'fs/promises';
import path from 'path';
import { CliProject } from './CliProject.js';
export class ProjectScanner {
    async scanDirectory(dir) {
        const resolved = path.resolve(dir);
        if (await this.isCliProject(resolved)) {
            const project = await this.createProjectFromDir(resolved, 'local');
            return project ? [project] : [];
        }
        return this.findSubProjects(resolved);
    }
    async scanDirectories(dirs) {
        const results = await Promise.all(dirs.map(d => this.scanDirectory(d)));
        return results.flat();
    }
    async isCliProject(dir) {
        try {
            const entry = path.join(dir, 'index.ts');
            await fs.access(entry);
            return true;
        }
        catch {
            return false;
        }
    }
    async findSubProjects(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const projects = [];
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const subPath = path.join(dir, entry.name);
                    if (await this.isCliProject(subPath)) {
                        const project = await this.createProjectFromDir(subPath, 'local');
                        if (project)
                            projects.push(project);
                    }
                }
            }
            return projects;
        }
        catch {
            return [];
        }
    }
    async createProjectFromDir(dir, source) {
        try {
            const entryPath = path.join(dir, 'index.ts');
            const content = await fs.readFile(entryPath, 'utf-8');
            const keyMatch = content.match(/cliMeta[\s\S]*?key[:\s]+['"]([^'"]+)['"]/);
            const nameMatch = content.match(/cliMeta[\s\S]*?name[:\s]+['"]([^'"]+)['"]/);
            const versionMatch = content.match(/cliMeta[\s\S]*?version[:\s]+['"]([^'"]+)['"]/);
            const descMatch = content.match(/cliMeta[\s\S]*?description[:\s]+['"]([^'"]+)['"]/);
            const key = keyMatch ? keyMatch[1] : path.basename(dir);
            const name = nameMatch ? nameMatch[1] : path.basename(dir);
            const version = versionMatch ? versionMatch[1] : undefined;
            const description = descMatch ? descMatch[1] : undefined;
            return new CliProject(key, name, dir, source, version, description);
        }
        catch {
            return null;
        }
    }
}
//# sourceMappingURL=ProjectScanner.js.map