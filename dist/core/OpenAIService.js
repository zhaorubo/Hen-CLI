import OpenAI from 'openai';
const SYSTEM_PROMPT = `你是一个 CLI 工具使用助手，帮助用户了解和使用 Hen CLI 管理工具。
回答简洁明了，提供实用的建议和示例。
Hen 的功能包括：
- 添加本地 CLI 项目 (hen add)
- 从 Git 远程安装 CLI 项目 (hen add --git)
- 列出已注册的 CLI 项目 (hen list)
- 删除 CLI 项目 (hen remove)
- 重载 CLI 项目 (hen reload)
- AI 问答 (hen ai)`;
export class OpenAIService {
    _openai;
    _config;
    _systemPrompt;
    constructor(config) {
        this._config = config;
        this._systemPrompt = SYSTEM_PROMPT;
        this._openai = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseUrl,
        });
    }
    async chat(message, onChunk) {
        if (onChunk) {
            let fullContent = '';
            const stream = await this._openai.chat.completions.create({
                model: this._config.model,
                messages: this._createMessages(message),
                stream: true,
                max_tokens: this._config.maxTokens,
                temperature: this._config.temperature,
            });
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content ?? '';
                if (content) {
                    fullContent += content;
                    onChunk(content);
                }
            }
            return fullContent;
        }
        const response = await this._openai.chat.completions.create({
            model: this._config.model,
            messages: this._createMessages(message),
            max_tokens: this._config.maxTokens,
            temperature: this._config.temperature,
        });
        return response.choices[0]?.message?.content ?? '';
    }
    async *chatStream(message) {
        const stream = await this._openai.chat.completions.create({
            model: this._config.model,
            messages: this._createMessages(message),
            stream: true,
            max_tokens: this._config.maxTokens,
            temperature: this._config.temperature,
        });
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content ?? '';
            if (content) {
                yield content;
            }
        }
    }
    isConfigured() {
        return !!this._config.apiKey && !!this._config.baseUrl;
    }
    _createMessages(userMessage) {
        return [
            { role: 'system', content: this._systemPrompt },
            { role: 'user', content: userMessage },
        ];
    }
}
//# sourceMappingURL=OpenAIService.js.map