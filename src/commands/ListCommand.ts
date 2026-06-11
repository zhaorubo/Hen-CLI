import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import * as clack from '@clack/prompts';

export class ListCommand extends BaseCommand {
  get name(): string { return 'list'; }
  get description(): string { return '列出所有已注册的 CLI 项目'; }

  createCommand(): Command {
    const cmd = new Command(this.name)
      .description(this.description)
      .option('--source <source>', '过滤来源 (local/git)')
      .action(async (options: Record<string, unknown>) => {
        try {
          const sourceFilter = options.source as string | undefined;
          let projects = this._registry.getAll();

          if (sourceFilter) {
            projects = projects.filter(p => p.source === sourceFilter);
          }

          if (projects.length === 0) {
            clack.log.warn('没有已注册的项目');
            return;
          }

          clack.intro('Hen CLI - 项目列表');

          const table = projects.map(p => {
            const sourceTag = p.source === 'git' ? '🔗 Git' : '📁 本地';
            const globalTag = p.globalLink ? '🌐' : '';
            return `${sourceTag.padEnd(8)} ${globalTag.padEnd(3)} ${p.key.padEnd(20)} ${p.name}${p.version ? ` v${p.version}` : ''}`;
          }).join('\n');

          clack.note(table, `共 ${projects.length} 个项目`);
          clack.outro('完成');
        } catch (error) {
          console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      });
    return cmd;
  }
}
