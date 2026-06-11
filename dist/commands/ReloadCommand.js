import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import * as clack from '@clack/prompts';
export class ReloadCommand extends BaseCommand {
    get name() { return 'reload'; }
    get description() { return '重载指定的 CLI 项目'; }
    createCommand() {
        const cmd = new Command(this.name)
            .description(this.description)
            .argument('[key]', '项目 key')
            .option('--all', '重载所有项目')
            .action(async (key, options) => {
            try {
                await this.handleReload(key, options);
            }
            catch (error) {
                console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
        return cmd;
    }
    async handleReload(key, options) {
        const reloadAll = options?.all;
        const projects = this._registry.getAll();
        if (projects.length === 0) {
            clack.log.warn('没有已注册的项目');
            return;
        }
        let keys;
        if (reloadAll) {
            keys = projects.map(p => p.key);
        }
        else if (key) {
            keys = [key];
        }
        else {
            const selected = await clack.select({
                message: '选择要重载的项目:',
                options: projects.map(p => ({
                    value: p.key,
                    label: p.name,
                    hint: `${p.key} (${p.source})`,
                })),
            });
            if (clack.isCancel(selected)) {
                clack.outro('已取消');
                return;
            }
            keys = [selected];
        }
        const spinner = clack.spinner();
        let successCount = 0;
        for (const k of keys) {
            spinner.start(`重载 ${k}...`);
            const success = await this._registry.reload(k);
            if (success) {
                spinner.stop(`已重载: ${k}`);
                successCount++;
            }
            else {
                spinner.stop(`重载失败: ${k}`);
            }
        }
        clack.outro(`成功重载 ${successCount}/${keys.length} 个项目`);
    }
}
//# sourceMappingURL=ReloadCommand.js.map