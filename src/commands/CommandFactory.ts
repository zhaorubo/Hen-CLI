import { BaseCommand } from './BaseCommand.js';
import { AddCommand } from './AddCommand.js';
import { RemoveCommand } from './RemoveCommand.js';
import { ListCommand } from './ListCommand.js';
import { ReloadCommand } from './ReloadCommand.js';
import { AiCommand } from './AiCommand.js';
import { ICliRegistry } from '../interfaces/ICliRegistry.js';
import { ProjectScanner } from '../core/ProjectScanner.js';
import { ModuleLoader } from '../core/ModuleLoader.js';
import { GitInstaller } from '../core/GitInstaller.js';
import { OpenAIService } from '../core/OpenAIService.js';
import { ConfigManager } from '../core/ConfigManager.js';

export class CommandFactory {
  static createAllCommands(
    registry: ICliRegistry,
    scanner: ProjectScanner,
    loader: ModuleLoader,
    configManager: ConfigManager,
    gitInstaller: GitInstaller,
    aiService: OpenAIService,
  ): BaseCommand[] {
    return [
      new AddCommand(registry, scanner, gitInstaller),
      new RemoveCommand(registry),
      new ListCommand(registry),
      new ReloadCommand(registry),
      new AiCommand(registry, aiService, configManager),
    ];
  }
}
