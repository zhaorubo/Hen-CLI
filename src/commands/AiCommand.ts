import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { OpenAIService } from '../core/OpenAIService.js';
import { ConfigManager } from '../core/ConfigManager.js';
import * as clack from '@clack/prompts';

export class AiCommand extends BaseCommand {
  private readonly _aiService: OpenAIService;
  private readonly _configManager: ConfigManager;

  constructor(registry: any, aiService: OpenAIService, configManager: ConfigManager) {
    super(registry);
    this._aiService = aiService;
    this._configManager = configManager;
  }

  get name(): string { return 'ai'; }
  get description(): string { return 'AI 问答（流式输出）'; }

  createCommand(): Command {
    const cmd = new Command(this.name)
      .description(this.description)
      .argument('[question]', '你的问题')
      .option('--configure', '配置 AI API')
      .action(async (question: string | undefined, options: Record<string, unknown>) => {
        try {
          await this.handleAi(question, options);
        } catch (error) {
          console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      });
    return cmd;
  }

  private async handleAi(question?: string, options?: Record<string, unknown>): Promise<void> {
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
      userQuestion = input as string;
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
    } catch (error) {
      clack.log.error(`AI 请求失败: ${error instanceof Error ? error.message : String(error)}`);
      clack.outro('完成');
      return;
    }

    clack.outro('回答完成');
  }

  private async configureAi(): Promise<void> {
    clack.intro('配置 AI');

    const apiKey = await clack.text({
      message: '输入 API Key:',
      placeholder: 'sk-xxx 或 your-api-key',
      validate: (value) => {
        if (!value) return 'API Key 不能为空';
      },
    });

    if (clack.isCancel(apiKey)) {
      clack.outro('已取消');
      return;
    }

    await this._configManager.updateAiConfig({ apiKey: apiKey as string });
    clack.log.success('API Key 已保存');
    clack.outro('配置完成');
  }
}
