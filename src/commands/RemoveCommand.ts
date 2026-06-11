import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import * as clack from '@clack/prompts';

export class RemoveCommand extends BaseCommand {
  get name(): string { return 'remove'; }
  get description(): string { return '删除已注册的 CLI 项目'; }

  createCommand(): Command {
    const cmd = new Command(this.name)
      .description(this.description)
      .argument('[key]', '项目 key')
      .action(async (key: string | undefined) => {
        try {
          await this.handleRemove(key);
        } catch (error) {
          console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      });
    return cmd;
  }

  private async handleRemove(key?: string): Promise<void> {
    if (!key) {
      const projects = this._registry.getAll();
      if (projects.length === 0) {
        clack.log.warn('没有已注册的项目');
        return;
      }

      const selected = await clack.select({
        message: '选择要删除的项目:',
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
      key = selected as string;
    }

    const project = this._registry.get(key);
    if (!project) {
      clack.log.error(`项目 "${key}" 不存在`);
      return;
    }

    const confirmed = await clack.confirm({
      message: `确认删除 "${project.name}" (${project.key})？`,
      initialValue: false,
    });

    if (clack.isCancel(confirmed) || !confirmed) {
      clack.outro('已取消');
      return;
    }

    const spinner = clack.spinner();
    spinner.start('删除中...');

    if (project.globalLink) {
      spinner.message('解除全局链接...');
      try {
        await this._registry.unlinkFromGlobal(project);
      } catch {
        // Unlink may fail, continue anyway
      }
    }

    const success = await this._registry.remove(key);
    spinner.stop();

    if (success) {
      clack.log.success(`已删除: ${project.name}`);
      clack.outro('删除成功');
    } else {
      clack.outro('删除失败');
    }
  }
}
