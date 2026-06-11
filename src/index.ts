#!/usr/bin/env node
import { Command } from 'commander';
import { ConfigManager } from './core/ConfigManager.js';
import { ProjectScanner } from './core/ProjectScanner.js';
import { ModuleLoader } from './core/ModuleLoader.js';
import { GitInstaller } from './core/GitInstaller.js';
import { OpenAIService } from './core/OpenAIService.js';
import { CliRegistry } from './core/CliRegistry.js';
import { CommandFactory } from './commands/CommandFactory.js';
import * as clack from '@clack/prompts';

async function bootstrap(): Promise<void> {
  // 1. 创建基础设施
  const configManager = new ConfigManager();
  await configManager.init();

  const scanner = new ProjectScanner();
  const loader = new ModuleLoader();
  const gitInstaller = new GitInstaller();

  // 2. 创建 AI 服务
  const aiService = new OpenAIService(configManager.aiConfig);

  // 3. 创建注册表
  const registry = new CliRegistry(configManager, scanner, loader);

  // 4. 初始化
  await registry.initialize();

  // 5. 创建命令
  const commands = CommandFactory.createAllCommands(
    registry, scanner, loader, configManager, gitInstaller, aiService
  );

  // 6. 创建主程序
  const program = new Command();
  program
    .name('hen')
    .description('Hen - CLI 管理工具')
    .version('1.0.0');

  // 7. 注册所有命令
  for (const cmd of commands) {
    const command = cmd.createCommand();
    program.addCommand(command);
  }

  // 8. 注册 CLI 项目的子命令
  for (const project of registry.getAll()) {
    const module = project.module;
    if (module) {
      try {
        module.register(program);
      } catch {
        // Skip projects that fail to register
      }
    }
  }

  // 9. 解析执行
  program.parse();
}

bootstrap().catch((error) => {
  clack.log.error(`启动失败: ${error instanceof Error ? error.message : String(error)}`);
  clack.outro('请检查配置或重试');
  process.exit(1);
});
