import { AddCommand } from './AddCommand.js';
import { RemoveCommand } from './RemoveCommand.js';
import { ListCommand } from './ListCommand.js';
import { ReloadCommand } from './ReloadCommand.js';
import { AiCommand } from './AiCommand.js';
export class CommandFactory {
    static createAllCommands(registry, scanner, loader, configManager, gitInstaller, aiService) {
        return [
            new AddCommand(registry, scanner, gitInstaller, configManager),
            new RemoveCommand(registry, configManager),
            new ListCommand(registry),
            new ReloadCommand(registry),
            new AiCommand(registry, aiService, configManager),
        ];
    }
}
//# sourceMappingURL=CommandFactory.js.map