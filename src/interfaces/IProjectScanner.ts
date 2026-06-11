import { CliProject } from '../core/CliProject.js';

export interface IProjectScanner {
  scanDirectory(dir: string): Promise<CliProject[]>;
  scanDirectories(dirs: string[]): Promise<CliProject[]>;
}
