import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import * as clack from '@clack/prompts';
import consoletable from '@xdooi/consoletable';
export class ListCommand extends BaseCommand {
    get name() { return 'list'; }
    get description() { return '列出所有已注册的 CLI 项目'; }
    createCommand() {
        const cmd = new Command(this.name)
            .description(this.description)
            .option('--source <source>', '过滤来源 (local/git)')
            .action(async (options) => {
            try {
                const sourceFilter = options.source;
                let projects = this._registry.getAll();
                if (sourceFilter) {
                    projects = projects.filter(p => p.source === sourceFilter);
                }
                if (projects.length === 0) {
                    clack.log.warn('没有已注册的项目');
                    return;
                }
                clack.intro('Hen CLI - 项目列表');
                const data = projects.map(p => ({
                    '类型': p.source === 'git' ? 'Git' : '本地',
                    '全局': p.globalLink ? '是' : '否',
                    'Key (调用名称)': p.key,
                    '名称': p.name,
                    '版本': p.version || '-',
                    '路径': p.path,
                }));
                consoletable.drawTable(data);
                clack.outro(`共 ${projects.length} 个项目`);
            }
            catch (error) {
                console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
        return cmd;
    }
}
//# sourceMappingURL=ListCommand.js.map