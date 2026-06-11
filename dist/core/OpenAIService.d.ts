import { IAIService } from '../interfaces/IAIService.js';
import { AiConfig } from '../types.js';
export declare class OpenAIService implements IAIService {
    private readonly _openai;
    private readonly _config;
    private readonly _systemPrompt;
    constructor(config: AiConfig);
    chat(message: string, onChunk?: (chunk: string) => void): Promise<string>;
    chatStream(message: string): AsyncGenerator<string>;
    isConfigured(): boolean;
    private _createMessages;
}
//# sourceMappingURL=OpenAIService.d.ts.map