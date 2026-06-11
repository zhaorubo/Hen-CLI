import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { CliProject } from '../core/CliProject.js';
import { ProjectScanner } from '../core/ProjectScanner.js';
import { GitInstaller } from '../core/GitInstaller.js';
import os from 'os';
import path from 'path';
import * as clack from '@clack/prompts';

export class AddCommand extends BaseCommand {
  private readonly _scanner: ProjectScanner;
  private readonly _gitInstaller: GitInstaller;

  constructor(registry: any, scanner: ProjectScanner, gitInstaller: GitInstaller) {
    super(registry);
    this._scanner = scanner;
    this._gitInstaller = gitInstaller;
  }

  get name(): string { return 'add'; }
  get description(): string { return '添加 CLI 项目（本地或 Git 远程）'; }

  createCommand(): Command {
    const cmd = new Command(this.name)
      .description(this.description)
      .argument('[path]', '本地项目路径')
      .option('--git <url>', 'Git 仓库 URL')
      .option('--branch <branch>', 'Git 分支')
      .action(async (argPath: string | undefined, options: Record<string, unknown>) => {
        try {
          const gitUrl = options.git as string | undefined;

          if (gitUrl) {
            await this.addGitProject(gitUrl, options.branch as string | undefined);
          } else if (argPath) {
            await this.addLocalProject(argPath);
          } else {
            await this.interactiveAdd();
          }
        } catch (error) {
          console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
          process.exit(1);
        }
      });
    return cmd;
  }

  private async interactiveAdd(): Promise<void> {
    const choice = await clack.select({
      message: '选择添加方式:',
      options: [
        { value: 'local', label: '本地项目', hint: '从本地文件夹添加' },
        { value: 'git', label: 'Git 远程', hint: '从 Git 仓库克隆' },
      ],
    });

    if (clack.isCancel(choice)) {
      clack.outro('已取消');
      return;
    }

    if (choice === 'local') {
      const dir = await clack.text({
        message: '输入 CLI 项目目录路径:',
        placeholder: '例如: ./my-cli-project',
      });

      if (clack.isCancel(dir)) {
        clack.outro('已取消');
        return;
      }
      await this.addLocalProject(dir);
    } else {
      const url = await clack.text({
        message: '输入 Git 仓库 URL:',
        placeholder: 'https://github.com/owner/repo.git',
        validate: (value) => {
          if (!value) return 'URL 不能为空';
          if (!value.startsWith('http') && !value.startsWith('git@')) {
            return '请输入有效的 Git 仓库 URL';
          }
        },
      });

      if (clack.isCancel(url)) {
        clack.outro('已取消');
        return;
      }
      await this.addGitProject(url);
    }
  }

  private async addLocalProject(dirPath: string): Promise<void> {
    const spinner = clack.spinner();
    spinner.start('扫描项目目录...');

    try {
      const projects = await this._scanner.scanDirectory(dirPath);

      if (projects.length === 0) {
        spinner.stop('未找到有效的 CLI 项目（缺少 index.ts）');
        clack.outro('添加失败');
        return;
      }

      spinner.stop('扫描完成');

      let added = 0;
      for (const project of projects) {
        const success = await this._registry.add(project);
        if (success) {
          clack.log.success(`已添加: ${project.name} (${project.key})`);
          added++;
        } else {
          clack.log.warn(`已存在: ${project.name} (${project.key})`);
        }
      }

      clack.outro(`成功添加 ${added} 个项目`);
    } catch (error) {
      spinner.stop('扫描失败');
      clack.outro(`错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async addGitProject(url: string, branch?: string): Promise<void> {
    const spinner = clack.spinner();
    spinner.start('验证仓库...');

    try {
      const targetDir = path.join(os.homedir(), '.hen', 'git-projects');
      const cloneTarget = await this._gitInstaller.clone(url, targetDir, {
        branch,
        shallow: true,
      });

      spinner.message('扫描克隆的项目...');
      const projects = await this._scanner.scanDirectory(cloneTarget);

      if (projects.length === 0) {
        spinner.stop('未找到有效的 CLI 项目');
        clack.outro('添加失败');
        return;
      }

      for (const project of projects) {
        const success = await this._registry.add(new CliProject(
          project.key,
          project.name,
          project.path,
          'git',
          project.version,
          project.description,
          url,
        ));
        if (success) {
          clack.log.success(`已添加: ${project.name} (${project.key})`);
        } else {
          clack.log.warn(`已存在: ${project.name} (${project.key})`);
        }
      }

      spinner.stop('克隆完成');
      clack.outro(`成功从 Git 添加 ${projects.length} 个项目`);
    } catch (error) {
      spinner.stop('克隆失败');
      clack.outro(`错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
