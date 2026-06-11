import { CliProject } from './CliProject.js';
import { IProjectScanner } from '../interfaces/IProjectScanner.js';
export declare class ProjectScanner implements IProjectScanner {
    scanDirectory(dir: string): Promise<CliProject[]>;
    scanDirectories(dirs: string[]): Promise<CliProject[]>;
    private isCliProject;
    private findSubProjects;
    private createProjectFromDir;
}
//# sourceMappingURL=ProjectScanner.d.ts.map