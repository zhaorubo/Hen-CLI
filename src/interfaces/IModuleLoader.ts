import { CliProject } from '../core/CliProject.js';
import { ICliModule } from './ICliModule.js';

export interface IModuleLoader {
  load(project: CliProject): Promise<ICliModule>;
  unload(key: string): Promise<void>;
  reload(project: CliProject): Promise<ICliModule>;
}
