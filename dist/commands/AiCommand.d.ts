import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { OpenAIService } from '../core/OpenAIService.js';
import { ConfigManager } from '../core/ConfigManager.js';
export declare class AiCommand extends BaseCommand {
    private readonly _aiService;
    private readonly _configManager;
    constructor(registry: any, aiService: OpenAIService, configManager: ConfigManager);
    get name(): string;
    get description(): string;
    createCommand(): Command;
    private handleAi;
    private configureAi;
}
//# sourceMappingURL=AiCommand.d.ts.map