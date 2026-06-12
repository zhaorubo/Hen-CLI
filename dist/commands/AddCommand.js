import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';
import { CliProject } from '../core/CliProject.js';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import * as clack from '@clack/prompts';
export class AddCommand extends BaseCommand {
    _scanner;
    _gitInstaller;
    _configManager;
    constructor(registry, scanner, gitInstaller, configManager) {
        super(registry);
        this._scanner = scanner;
        this._gitInstaller = gitInstaller;
        this._configManager = configManager;
    }
    get name() { return 'add'; }
    get description() { return '添加 CLI 项目（本地或 Git 远程）'; }
    createCommand() {
        const cmd = new Command(this.name)
            .description(this.description)
            .argument('[path]', '本地项目路径')
            .option('--git <url>', 'Git 仓库 URL')
            .option('--branch <branch>', 'Git 分支')
            .option('-g, --global', '创建全局链接')
            .action(async (argPath, options) => {
            try {
                const gitUrl = options.git;
                const globalLink = options.global || false;
                if (gitUrl) {
                    await this.addGitProject(gitUrl, options.branch, globalLink);
                }
                else if (argPath) {
                    await this.addLocalProject(argPath, globalLink);
                }
                else {
                    await this.interactiveAdd(globalLink);
                }
            }
            catch (error) {
                console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
        return cmd;
    }
    async interactiveAdd(globalLink = false) {
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
            await this.addLocalProject(dir, globalLink);
        }
        else {
            const url = await clack.text({
                message: '输入 Git 仓库 URL:',
                placeholder: 'https://github.com/owner/repo.git',
                validate: (value) => {
                    if (!value)
                        return 'URL 不能为空';
                    if (!value.startsWith('http') && !value.startsWith('git@')) {
                        return '请输入有效的 Git 仓库 URL';
                    }
                },
            });
            if (clack.isCancel(url)) {
                clack.outro('已取消');
                return;
            }
            await this.addGitProject(url, undefined, globalLink);
        }
    }
    getGlobalLinkSuffix(globalLink, globalLinkResult) {
        if (!globalLink)
            return '';
        if (globalLinkResult === 'success')
            return ' [全局链接成功]';
        if (globalLinkResult === 'no-package-json')
            return ' [警告: 项目无 package.json，未创建全局链接]';
        return ' [警告: 全局链接失败]';
    }
    async copyDir(src, dest) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules' || entry.name === '.git') {
                    continue;
                }
                await this.copyDir(srcPath, destPath);
            }
            else {
                await fs.copyFile(srcPath, destPath);
            }
        }
    }
    async addLocalProject(dirPath, globalLink = false) {
        const spinner = clack.spinner();
        spinner.start('扫描项目目录...');
        try {
            const projects = await this._scanner.scanDirectory(dirPath);
            if (projects.length === 0) {
                spinner.stop('未找到有效的 CLI 项目（缺少 index.ts）');
                clack.outro('添加失败');
                return;
            }
            spinner.message('添加项目中...');
            const projectsDir = this._configManager.projectsDir;
            await fs.mkdir(projectsDir, { recursive: true });
            const copiedProjects = [];
            for (const project of projects) {
                const destPath = path.join(projectsDir, project.key);
                await this.copyDir(project.path, destPath);
                const copiedProject = new CliProject(project.key, project.name, destPath, 'local', project.version, project.description, project.gitUrl, globalLink);
                copiedProjects.push(copiedProject);
            }
            spinner.stop();
            let added = 0;
            for (const project of copiedProjects) {
                const result = await this._registry.add(project);
                if (result.added) {
                    const suffix = this.getGlobalLinkSuffix(globalLink, result.globalLinkResult);
                    clack.log.success(`已添加: ${project.name} (${project.key})${suffix}`);
                    added++;
                }
                else {
                    clack.log.warn(`已存在: ${project.name} (${project.key})`);
                }
            }
            clack.outro(`成功添加 ${added} 个项目`);
        }
        catch (error) {
            spinner.stop('扫描失败');
            clack.outro(`错误: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async addGitProject(url, branch, globalLink = false) {
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
            spinner.message('复制项目到 .hen/projects...');
            const projectsDir = this._configManager.projectsDir;
            await fs.mkdir(projectsDir, { recursive: true });
            const copiedProjects = [];
            for (const project of projects) {
                const destPath = path.join(projectsDir, project.key);
                await this.copyDir(project.path, destPath);
                const copiedProject = new CliProject(project.key, project.name, destPath, 'git', project.version, project.description, url, globalLink);
                copiedProjects.push(copiedProject);
            }
            spinner.stop('复制完成');
            for (const project of copiedProjects) {
                const result = await this._registry.add(project);
                if (result.added) {
                    const suffix = this.getGlobalLinkSuffix(globalLink, result.globalLinkResult);
                    clack.log.success(`已添加: ${project.name} (${project.key})${suffix}`);
                }
                else {
                    clack.log.warn(`已存在: ${project.name} (${project.key})`);
                }
            }
            clack.outro(`成功从 Git 添加 ${projects.length} 个项目`);
        }
        catch (error) {
            spinner.stop('克隆失败');
            clack.outro(`错误: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
//# sourceMappingURL=AddCommand.js.map