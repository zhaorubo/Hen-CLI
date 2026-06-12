import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { ConfigManager } from '../core/ConfigManager.js';
import fs from 'fs/promises';
import * as clack from '@clack/prompts';

export class RemoveCommand extends BaseCommand {
  private readonly _configManager: ConfigManager;

  constructor(registry: any, configManager: ConfigManager) {
    super(registry);
    this._configManager = configManager;
  }

  get name(): string { return 'remove'; }
  get description(): string { return '删除已注册的 CLI 项目'; }

  createCommand(): Command {
    const cmd = new Command(this.name)
      .description(this.description)
      .argument('[key]', '项目 key')
      .option('-rf, --force-remove', '同时删除 .hen/projects 目录下的项目文件')
      .action(async (key: string | undefined, options: Record<string, unknown>) => {
        try {
          const forceRemove = (options.forceRemove as boolean) || false;
          await this.handleRemove(key, forceRemove);
        } catch (error) {
          console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      });
    return cmd;
  }

  private async handleRemove(key?: string, forceRemove: boolean = false): Promise<void> {
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

    let confirmMsg = `确认删除 "${project.name}" (${project.key})？`;
    if (forceRemove) {
      confirmMsg += ` (同时删除项目文件)`;
    }
    
    const confirmed = await clack.confirm({
      message: confirmMsg,
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
    
    if (success && forceRemove) {
      spinner.message('删除项目文件...');
      try {
        const projectPath = project.path;
        await fs.rm(projectPath, { recursive: true, force: true });
      } catch {
        clack.log.warn('删除项目文件失败');
      }
    }
    
    spinner.stop();

    if (success) {
      clack.log.success(`已删除: ${project.name}`);
      if (forceRemove) {
        clack.log.success('项目文件已删除');
      }
      clack.outro('删除成功');
    } else {
      clack.outro('删除失败');
    }
  }
}
