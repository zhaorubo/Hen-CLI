import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import * as clack from '@clack/prompts';
export class AiCommand extends BaseCommand {
    _aiService;
    _configManager;
    constructor(registry, aiService, configManager) {
        super(registry);
        this._aiService = aiService;
        this._configManager = configManager;
    }
    get name() { return 'ai'; }
    get description() { return 'AI 问答（流式输出）'; }
    createCommand() {
        const cmd = new Command(this.name)
            .description(this.description)
            .argument('[question]', '你的问题')
            .option('--configure', '配置 AI API')
            .action(async (question, options) => {
            try {
                await this.handleAi(question, options);
            }
            catch (error) {
                console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
        return cmd;
    }
    async handleAi(question, options) {
        if (options?.configure) {
            await this.configureAi();
            return;
        }
        if (!this._aiService.isConfigured()) {
            clack.log.warn('AI 未配置，请使用 hen ai --configure 配置 API Key');
            return;
        }
        let userQuestion = question || '';
        if (!userQuestion) {
            const input = await clack.text({
                message: '请输入你的问题:',
                placeholder: '例如：如何使用 Hen 管理 CLI 项目？',
            });
            if (clack.isCancel(input)) {
                clack.outro('已取消');
                return;
            }
            userQuestion = input;
        }
        clack.intro('Hen AI 助手');
        const spinner = clack.spinner();
        spinner.start('AI 正在思考...');
        let fullContent = '';
        try {
            const stream = this._aiService.chatStream(userQuestion);
            spinner.stop();
            process.stdout.write('\n');
            for await (const chunk of stream) {
                fullContent += chunk;
                process.stdout.write(chunk);
            }
            process.stdout.write('\n\n');
        }
        catch (error) {
            clack.log.error(`AI 请求失败: ${error instanceof Error ? error.message : String(error)}`);
            clack.outro('完成');
            return;
        }
        clack.outro('回答完成');
    }
    async configureAi() {
        clack.intro('配置 AI');
        const apiKey = await clack.text({
            message: '输入 API Key:',
            placeholder: 'sk-xxx 或 your-api-key',
            validate: (value) => {
                if (!value)
                    return 'API Key 不能为空';
            },
        });
        if (clack.isCancel(apiKey)) {
            clack.outro('已取消');
            return;
        }
        await this._configManager.updateAiConfig({ apiKey: apiKey });
        clack.log.success('API Key 已保存');
        clack.outro('配置完成');
    }
}
//# sourceMappingURL=AiCommand.js.map