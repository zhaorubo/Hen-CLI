# Hen CLI 开发规范

> 本文档为 Hen CLI 项目的开发规范，适用于所有参与开发的 AI Agent 和开发者。

---

## 1. 项目概述

### 1.1 项目信息
- **名称**: hen
- **描述**: CLI 管理工具，用于管理和扩展命令行工具
- **版本**: 1.0.0
- **许可证**: MIT
- **包管理器**: npm

### 1.2 核心功能
- 添加本地/Git 远程 CLI 项目
- 全局链接 CLI 模块（`-g` 参数）
- 列出、删除、重载已注册的 CLI 项目
- AI 问答助手
- 动态加载和执行 CLI 子命令

### 1.3 技术栈
- **运行时**: Node.js (ES2022)
- **语言**: TypeScript (strict mode)
- **模块系统**: ES Modules (`"type": "module"`)
- **CLI 框架**: commander.js
- **交互界面**: @clack/prompts
- **Git 操作**: simple-git
- **AI 服务**: openai SDK

---

## 2. 项目结构

```
Hen-CLI/
├── bin/                    # 可执行文件入口
│   └── hen.js              # shebang 入口，引用 dist/index.js
├── src/                    # 源代码
│   ├── index.ts            # 主入口，bootstrap 函数
│   ├── types.ts            # 类型定义
│   ├── commands/           # 命令实现
│   │   ├── BaseCommand.ts      # 命令基类（抽象类）
│   │   ├── CommandFactory.ts   # 命令工厂
│   │   ├── AddCommand.ts       # 添加命令
│   │   ├── RemoveCommand.ts    # 删除命令
│   │   ├── ListCommand.ts      # 列表命令
│   │   ├── ReloadCommand.ts    # 重载命令
│   │   └── AiCommand.ts        # AI 命令
│   ├── core/               # 核心业务逻辑
│   │   ├── CliProject.ts       # CLI 项目模型
│   │   ├── CliRegistry.ts      # 注册表管理
│   │   ├── ConfigManager.ts    # 配置管理
│   │   ├── ModuleLoader.ts     # 模块加载器
│   │   ├── ProjectScanner.ts   # 项目扫描器
│   │   ├── GitInstaller.ts     # Git 安装器
│   │   └── OpenAIService.ts    # AI 服务
│   └── interfaces/         # 接口定义
│       ├── ICliModule.ts       # CLI 模块接口
│       ├── ICliRegistry.ts     # 注册表接口
│       ├── IModuleLoader.ts    # 模块加载器接口
│       ├── IProjectScanner.ts  # 扫描器接口
│       ├── IGitInstaller.ts    # Git 安装器接口
│       └── IAIService.ts       # AI 服务接口
├── dist/                   # 编译输出（自动生成，勿手动修改）
├── cli-projects/           # CLI 项目存放目录
├── docs/                   # 文档
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
└── .gitignore              # Git 忽略规则
```

### 2.1 目录职责

| 目录 | 职责 | 约束 |
|------|------|------|
| `src/commands/` | 用户命令的实现 | 每个命令继承 `BaseCommand`，通过 `CommandFactory` 注册 |
| `src/core/` | 核心业务逻辑 | 包含主要服务类，依赖接口而非具体实现 |
| `src/interfaces/` | 接口定义 | 定义契约，支持依赖注入和测试 |
| `dist/` | 编译输出 | **自动生成，不要手动编辑** |

---

## 3. 架构设计

### 3.1 启动流程

```
bootstrap()
  ├── 1. 创建基础设施（ConfigManager, Scanner, Loader, GitInstaller）
  ├── 2. 创建 AI 服务（OpenAIService）
  ├── 3. 创建注册表（CliRegistry）
  ├── 4. 初始化注册表（加载已注册项目）
  ├── 5. 创建所有命令（CommandFactory）
  ├── 6. 创建主程序（Commander）
  ├── 7. 注册命令到主程序
  ├── 8. 注册 CLI 项目的子命令
  └── 9. 解析执行（program.parse()）
```

### 3.2 依赖注入模式

```
src/index.ts (组装层)
  ├── ConfigManager ──┬── CliRegistry
  ├── ProjectScanner ─┤
  ├── ModuleLoader ───┤
  ├── GitInstaller ───┼── CommandFactory ──┬── AddCommand
  ├── OpenAIService ──┤                    ├── RemoveCommand
  └── CliRegistry ────┘                    ├── ListCommand
                                           ├── ReloadCommand
                                           └── AiCommand
```

### 3.3 模块加载机制

CLI 子模块是动态加载的，模块必须满足以下要求：

1. 项目目录包含 `index.ts` 文件
2. 导出 `cliMeta` 对象（包含 `key` 和 `name`）
3. 导出 `register(command: Command)` 函数
4. 可选导出 `dispose()` 函数

```typescript
// 子模块示例
export const cliMeta = {
  key: 'my-cli',
  name: 'My CLI',
  version: '1.0.0',
  description: 'My CLI tool',
};

export function register(program: Command): void {
  program
    .command('my-command')
    .description('My command')
    .action(() => { console.log('Hello!'); });
}

export function dispose(): void {
  // 清理资源（可选）
}
```

### 3.4 配置存储

- **注册表路径**: `~/.hen/registry.json`
- **Git 项目路径**: `~/.hen/git-projects/`
- **配置文件格式**: JSON

---

## 4. 面向对象设计原则

> 本项目严格遵循面向对象编程思想，所有代码设计必须以 **可维护性、可读性、可扩展性** 为核心目标。

### 4.1 SOLID 原则

#### 4.1.1 单一职责原则 (SRP - Single Responsibility Principle)

**每个类只负责一个功能领域，并且完全封装该功能。**

```typescript
// ✅ 正确 - 每个类职责单一
export class ConfigManager {
  // 只负责配置的读取、保存和管理
}

export class CliRegistry {
  // 只负责 CLI 项目的注册、查询和生命周期管理
}

export class ModuleLoader {
  // 只负责动态模块的加载、卸载和重载
}

// ❌ 错误 - 一个类承担过多职责
export class HenManager {
  // 同时负责配置、注册、加载、Git 操作...
  // 违反 SRP，难以维护和测试
}
```

**判断标准**：如果一个类超过 200 行，或者可以用 "和" 来描述它的职责（如 "负责配置管理和 Git 安装"），则可能违反了 SRP。

#### 4.1.2 开闭原则 (OCP - Open Closed Principle)

**对扩展开放，对修改封闭。新功能通过扩展现有代码实现，而非修改已有代码。**

```typescript
// ✅ 正确 - 通过继承扩展功能
export abstract class BaseCommand {
  abstract createCommand(): Command;
}

// 添加新功能时创建新类，不修改 BaseCommand
export class MyNewCommand extends BaseCommand {
  createCommand(): Command { /* ... */ }
}

// ❌ 错误 - 通过修改已有类添加功能
export class CommandFactory {
  static create(type: string) {
    if (type === 'add') return new AddCommand();
    if (type === 'remove') return new RemoveCommand();
    if (type === 'new') return new NewCommand(); // 每次添加新功能都要修改这里
  }
}
```

#### 4.1.3 里氏替换原则 (LSP - Liskov Substitution Principle)

**子类必须能够替换其父类而不影响程序的正确性。**

```typescript
// ✅ 正确 - 子类完全遵循父类的契约
export abstract class BaseCommand {
  abstract createCommand(): Command;
}

export class AddCommand extends BaseCommand {
  // 返回的 Command 对象完全符合父类契约
  createCommand(): Command {
    return new Command('add').action(async () => { /* ... */ });
  }
}

// ❌ 错误 - 子类改变了父类的行为约定
class BadCommand extends BaseCommand {
  createCommand(): Command {
    // 返回了不符合预期的对象，或抛出了未声明的异常
    throw new Error('Not implemented');
  }
}
```

#### 4.1.4 接口隔离原则 (ISP - Interface Segregation Principle)

**使用多个专门的接口，而非一个臃肿的通用接口。**

```typescript
// ✅ 正确 - 接口职责明确且精简
export interface IProjectScanner {
  scanDirectory(dir: string): Promise<CliProject[]>;
  scanDirectories(dirs: string[]): Promise<CliProject[]>;
}

export interface IModuleLoader {
  load(project: CliProject): Promise<ICliModule>;
  unload(key: string): Promise<void>;
  reload(project: CliProject): Promise<ICliModule>;
}

// ❌ 错误 - 一个接口包含过多不相关的职责
export interface IHenService {
  scanDirectory(): void;
  loadModule(): void;
  installGit(): void;
  chatWithAI(): void;
  saveConfig(): void;
  // ... 几十个不相关的方法
}
```

#### 4.1.5 依赖倒置原则 (DIP - Dependency Inversion Principle)

**高层模块不应依赖低层模块，两者都应依赖抽象。抽象不应依赖细节，细节应依赖抽象。**

```typescript
// ✅ 正确 - 依赖接口（抽象）
export class CliRegistry {
  constructor(
    private readonly _scanner: IProjectScanner,  // 依赖抽象
    private readonly _loader: IModuleLoader       // 依赖抽象
  ) {}
}

// ✅ 具体实现也实现接口
export class ProjectScanner implements IProjectScanner { /* ... */ }

// ❌ 错误 - 直接依赖具体实现
export class CliRegistry {
  constructor(
    private readonly _scanner: ProjectScanner,  // 依赖具体类，无法替换
    private readonly _loader: ModuleLoader
  ) {}
}
```

### 4.2 设计模式应用

#### 4.2.1 工厂模式 (Factory Pattern)

**用于创建对象，将对象创建与使用分离。**

```typescript
// 命令工厂 - 集中管理所有命令的创建
export class CommandFactory {
  static createAllCommands(
    registry: ICliRegistry,
    scanner: ProjectScanner,
    loader: ModuleLoader,
    configManager: ConfigManager,
    gitInstaller: GitInstaller,
    aiService: OpenAIService,
  ): BaseCommand[] {
    return [
      new AddCommand(registry, scanner, gitInstaller),
      new RemoveCommand(registry),
      new ListCommand(registry),
      new ReloadCommand(registry),
      new AiCommand(registry, aiService, configManager),
    ];
  }
}
```

#### 4.2.2 策略模式 (Strategy Pattern)

**定义一系列算法，使它们可以相互替换。**

本项目中，不同的 CLI 模块通过统一的 `ICliModule` 接口注册，实现策略模式：

```typescript
// 所有 CLI 模块遵循同一接口，可以互相替换
for (const project of registry.getAll()) {
  const module = project.module;
  if (module) {
    module.register(program);  // 任何实现 ICliModule 的对象都可以被调用
  }
}
```

#### 4.2.3 观察者模式 (Observer Pattern)

**通过事件机制实现对象间的一对多依赖。**

```typescript
// Spinner 通过回调实现观察者模式
const spinner = clack.spinner();
spinner.start('处理中...');
spinner.message('继续处理...');  // 通知所有观察者状态变化
spinner.stop('完成');
```

### 4.3 面向对象设计最佳实践

#### 4.3.1 封装性

- **字段私有化**：所有内部状态使用 `private` 修饰符
- **通过 getter 暴露只读属性**：防止外部修改内部状态
- **通过方法控制状态变更**：所有状态变更必须通过明确定义的方法

```typescript
export class CliProject {
  private readonly _key: string;     // 不可变，外部只读
  private readonly _name: string;
  private _module?: ICliModule;      // 可变，通过受控方法修改

  get key(): string { return this._key; }
  get name(): string { return this._name; }
  get module(): ICliModule | undefined { return this._module; }

  // 受控的状态变更方法
  setModule(module: ICliModule): void {
    this._module = module;
  }

  clearModule(): void {
    this._module = undefined;
  }
}
```

#### 4.3.2 组合优于继承

- **优先使用组合**来扩展功能，而非深层继承
- **继承适用于 is-a 关系，组合适用于 has-a 关系**

```typescript
// ✅ 正确 - 组合模式
export class CliRegistry {
  private readonly _scanner: IProjectScanner;  // 组合
  private readonly _loader: IModuleLoader;     // 组合

  async add(project: CliProject): Promise<boolean> {
    await this._loader.load(project);  // 委托给组合的对象
    // ...
  }
}

// ❌ 错误 - 过深的继承链
class AdvancedGitCliManager extends GitManager extends BaseManager extends Manager {
  // 继承链过深，难以理解和修改
}
```

#### 4.3.3 依赖注入

- **通过构造函数注入依赖**，而非在类内部创建
- **便于测试**：可以轻松替换 mock 对象
- **提高解耦**：类不关心依赖的具体实现

```typescript
// ✅ 正确 - 构造函数依赖注入
export class AiCommand extends BaseCommand {
  private readonly _aiService: IAIService;
  private readonly _configManager: ConfigManager;

  constructor(
    registry: ICliRegistry,
    aiService: IAIService,
    configManager: ConfigManager
  ) {
    super(registry);
    this._aiService = aiService;
    this._configManager = configManager;
  }
}

// ❌ 错误 - 内部创建依赖
export class AiCommand extends BaseCommand {
  private _aiService: IAIService;

  constructor(registry: ICliRegistry) {
    super(registry);
    this._aiService = new OpenAIService();  // 硬编码依赖，无法替换
  }
}
```

### 4.4 代码可维护性规范

#### 4.4.1 方法长度限制

- 单个方法不超过 **30 行**
- 超过限制时提取私有方法

```typescript
// ✅ 正确 - 提取子方法
private async addLocalProject(dirPath: string, globalLink: boolean): Promise<void> {
  const spinner = clack.spinner();
  spinner.start('扫描项目目录...');

  const projects = await this._scanner.scanDirectory(dirPath);

  if (projects.length === 0) {
    this.handleEmptyProjects(spinner);
    return;
  }

  const added = await this.registerProjects(projects, globalLink);
  clack.outro(`成功添加 ${added} 个项目`);
}

private handleEmptyProjects(spinner: ReturnType<typeof clack.spinner>): void {
  spinner.stop('未找到有效的 CLI 项目（缺少 index.ts）');
  clack.outro('添加失败');
}

private async registerProjects(projects: CliProject[], globalLink: boolean): Promise<number> {
  let added = 0;
  for (const project of projects) {
    const success = await this._registry.add(project);
    if (success) {
      clack.log.success(`已添加: ${project.name} (${project.key})`);
      added++;
    }
  }
  return added;
}
```

#### 4.4.2 早期返回 (Early Return)

**减少嵌套，提高可读性。**

```typescript
// ✅ 正确 - 早期返回，平坦结构
async handleRemove(key?: string): Promise<void> {
  if (!key) {
    key = await this.selectProject();
    if (!key) return;
  }

  const project = this._registry.get(key);
  if (!project) {
    clack.log.error(`项目 "${key}" 不存在`);
    return;
  }

  const confirmed = await this.confirmDeletion(project);
  if (!confirmed) return;

  await this.performRemoval(project);
}

// ❌ 错误 - 深层嵌套
async handleRemove(key?: string): Promise<void> {
  if (key) {
    const project = this._registry.get(key);
    if (project) {
      const confirmed = await this.confirmDeletion(project);
      if (confirmed) {
        await this.performRemoval(project);
      }
    } else {
      clack.log.error(`项目 "${key}" 不存在`);
    }
  } else {
    // ...
  }
}
```

#### 4.4.3 单一抽象层级

**同一方法内的代码应处于相同的抽象层级。**

```typescript
// ✅ 正确 - 统一的抽象层级
async add(project: CliProject): Promise<boolean> {
  if (this._projects.has(project.key)) {
    return false;
  }

  await this.loadModule(project);       // 高级抽象
  await this.registerProject(project);   // 高级抽象
  await this.persistChanges(project);    // 高级抽象

  return true;
}

private async loadModule(project: CliProject): Promise<void> {
  await this._loader.load(project);
}

private async registerProject(project: CliProject): Promise<void> {
  this._projects.set(project.key, project);
}

private async persistChanges(project: CliProject): Promise<void> {
  await this._configManager.addProject(project.serialize());
}
```

### 4.5 代码可读性规范

#### 4.5.1 命名即文档

**变量名、方法名应当清楚表达其意图，不需要额外注释。**

```typescript
// ✅ 清晰命名
async linkToGlobal(project: CliProject): Promise<void> {
  await execAsync('npm link', { cwd: project.path });
}

async unlinkFromGlobal(project: CliProject): Promise<void> {
  await execAsync(`npm unlink -g ${project.name}`, { cwd: project.path });
}

// ❌ 模糊命名
async global(project: CliProject): Promise<void> { }
async removeGlobal(project: CliProject): Promise<void> { }
```

#### 4.5.2 注释说明 Why 而非 What

```typescript
// ✅ 正确 - 解释原因
if (project.globalLink) {
  try {
    await this.linkToGlobal(project);
  } catch {
    // 全局链接失败不影响主流程，继续注册
  }
}

// ❌ 错误 - 重复代码功能
// 如果项目有全局链接标志，则调用 linkToGlobal
if (project.globalLink) {
  await this.linkToGlobal(project);
}
```

### 4.6 代码可扩展性规范

#### 4.6.1 面向接口编程

**所有对外暴露的 API 应当基于接口，而非具体实现。**

```typescript
// ✅ 对外暴露接口
export interface ICliRegistry {
  add(project: CliProject): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  // ...
}

// 使用者依赖接口
export class AiCommand extends BaseCommand {
  protected readonly _registry: ICliRegistry;  // 可以替换为任何实现
}
```

#### 4.6.2 预留扩展点

**设计时考虑未来可能的变化，预留扩展点。**

```typescript
// ✅ 使用 abstract class 提供钩子
export abstract class BaseCommand {
  protected readonly _registry: ICliRegistry;

  constructor(registry: ICliRegistry) {
    this._registry = registry;
  }

  // 子类可以覆盖这些钩子
  protected async beforeExecute?(): Promise<void>;
  protected async afterExecute?(): Promise<void>;

  abstract createCommand(): Command;
}

// ✅ 接口提供扩展能力
export interface ICliModule {
  readonly meta: CliMetaInfo;
  register(command: Command): void;
  dispose?(): void;  // 可选的清理钩子
}
```

### 4.7 编码规范（基础）

### 4.7.1 TypeScript 配置要求

```json
{
  "compilerOptions": {
    "strict": true,                    // 严格模式
    "module": "ESNext",                // ES 模块
    "moduleResolution": "bundler",     // bundler 模式
    "target": "ES2022",
    "forceConsistentCasingInFileNames": true  // 文件名大小写一致
  }
}
```

### 4.2 文件命名

- **源文件**: PascalCase（类文件）或 camelCase
- **接口文件**: `I` 前缀 + PascalCase，如 `ICliModule.ts`
- **导入扩展**: 必须使用 `.js` 后缀（即使导入 `.ts` 文件）

```typescript
// ✅ 正确
import { CliProject } from './CliProject.js';
import { ICliModule } from '../interfaces/ICliModule.js';

// ❌ 错误
import { CliProject } from './CliProject';
import { CliProject } from './CliProject.ts';
```

### 4.3 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 类 | PascalCase | `CliProject`, `ConfigManager` |
| 接口 | PascalCase + `I` 前缀 | `ICliModule`, `IProjectScanner` |
| 方法/函数 | camelCase | `scanDirectory`, `createProject` |
| 私有字段 | `_` 前缀 + camelCase | `_configPath`, `_projects` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_AI_CONFIG`, `SYSTEM_PROMPT` |
| 类型/接口 | PascalCase | `CliMetaInfo`, `SerializedProject` |
| 枚举值 | PascalCase | `'local' \| 'git'` |

### 4.4 类设计规范

#### 4.4.1 私有字段使用 getter

```typescript
export class CliProject {
  private readonly _key: string;
  private readonly _name: string;
  private _module?: ICliModule;

  get key(): string { return this._key; }
  get name(): string { return this._name; }
  get module(): ICliModule | undefined { return this._module; }
}
```

#### 4.4.2 依赖接口而非实现

```typescript
// ✅ 正确 - 使用接口
constructor(
  configManager: ConfigManager,
  scanner: IProjectScanner,
  loader: IModuleLoader
)

// ❌ 错误 - 直接使用具体类
constructor(
  scanner: ProjectScanner,
  loader: ModuleLoader
)
```

#### 4.4.3 命令类继承 BaseCommand

```typescript
export abstract class BaseCommand {
  protected readonly _registry: ICliRegistry;

  constructor(registry: ICliRegistry) {
    this._registry = registry;
  }

  abstract get name(): string;
  abstract get description(): string;
  abstract createCommand(): Command;
}
```

所有命令必须继承 `BaseCommand` 并实现三个抽象成员。

### 4.5 异步错误处理

#### 4.5.1 命令级别错误处理

```typescript
.action(async (argPath: string | undefined, options: Record<string, unknown>) => {
  try {
    await this.handleAction(argPath, options);
  } catch (error) {
    console.error(`错误: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
});
```

#### 4.5.2 可选操作错误处理

```typescript
// 对于非关键操作，捕获并忽略错误
try {
  await this._loader.load(project);
} catch {
  // Module may not be valid, add anyway
}
```

#### 4.5.3 错误信息格式

```typescript
// ✅ 使用类型安全的错误处理
clack.log.error(`启动失败: ${error instanceof Error ? error.message : String(error)}`);

// ❌ 避免直接访问 message
clack.log.error(`启动失败: ${error.message}`);
```

### 4.6 UI 交互规范

使用 `@clack/prompts` 进行交互式 CLI：

```typescript
import * as clack from '@clack/prompts';

// 进度指示
const spinner = clack.spinner();
spinner.start('处理中...');
spinner.message('继续处理...');
spinner.stop('完成');

// 日志输出
clack.log.success('成功消息');
clack.log.warn('警告消息');
clack.log.error('错误消息');

// 用户输入
const value = await clack.text({ message: '请输入:', placeholder: '示例' });
const choice = await clack.select({ message: '选择:', options: [...] });
const confirmed = await clack.confirm({ message: '确认？', initialValue: false });

// 检查取消
if (clack.isCancel(value)) {
  clack.outro('已取消');
  return;
}

// 结束
clack.outro('完成');
```

### 4.7 导入顺序

```typescript
// 1. 外部库
import { Command } from 'commander';
import * as clack from '@clack/prompts';
import path from 'path';
import fs from 'fs/promises';

// 2. 内部模块（按层级排序）
import { CliProject } from '../core/CliProject.js';
import { ICliModule } from '../interfaces/ICliModule.js';
```

---

## 5. 功能扩展指南

### 5.1 添加新命令

1. 在 `src/commands/` 创建新命令文件
2. 继承 `BaseCommand`
3. 在 `CommandFactory.createAllCommands()` 中注册

```typescript
// src/commands/MyCommand.ts
import { Command } from 'commander';
import { BaseCommand } from './BaseCommand.js';

export class MyCommand extends BaseCommand {
  get name(): string { return 'my'; }
  get description(): string { return '我的命令'; }

  createCommand(): Command {
    return new Command(this.name)
      .description(this.description)
      .argument('<arg>', '参数描述')
      .option('-f, --flag', '选项描述')
      .action(async (arg: string, options: Record<string, unknown>) => {
        // 实现逻辑
      });
  }
}
```

```typescript
// src/commands/CommandFactory.ts - 添加注册
import { MyCommand } from './MyCommand.js';

return [
  // ...existing commands
  new MyCommand(registry),
];
```

### 5.2 添加新服务

1. 在 `src/interfaces/` 定义接口
2. 在 `src/core/` 实现服务
3. 在 `src/index.ts` 中组装

```typescript
// src/interfaces/IMyService.ts
export interface IMyService {
  doSomething(): Promise<void>;
}

// src/core/MyService.ts
import { IMyService } from '../interfaces/IMyService.js';

export class MyService implements IMyService {
  async doSomething(): Promise<void> {
    // 实现
  }
}
```

### 5.3 添加新的配置字段

1. 在 `src/types.ts` 添加类型定义
2. 在 `ConfigManager` 中添加读写方法
3. 更新默认配置

---

## 6. 开发工作流

### 6.1 常用命令

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 监听模式编译
npm run dev

# 运行 CLI（编译后）
npm start
# 或
node --no-warnings dist/index.js <command>

# 运行 CLI（开发模式，无需编译）
npm run hen -- <command>
# 或
tsx --no-warnings src/index.ts <command>
```

### 6.2 添加依赖

```bash
# 运行时依赖
npm install <package>

# 开发依赖
npm install -D <package>
```

### 6.3 编译注意事项

- `dist/` 目录是自动生成的，**不要手动修改**
- 所有 `.ts` 文件编译后生成 `.js`、`.d.ts`、`.js.map`、`.d.ts.map`
- 导入路径必须使用 `.js` 后缀，否则编译后无法运行

---

## 7. Git 工作流

### 7.1 忽略规则

```gitignore
.trae/
node_modules/
```

### 7.2 提交规范

提交信息格式：`type: description`

| type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具链变更 |

示例：
```
feat: 添加 CLI 模块全局链接功能 (-g/--global 参数)
fix: 修复模块加载路径错误
docs: 更新 API 文档
```

### 7.3 推送流程

```bash
git add .
git commit -m "type: description"
git push
```

---

## 8. 配置和常量

### 8.1 默认 AI 配置

```typescript
const DEFAULT_AI_CONFIG: AiConfig = {
  apiKey: '0cd3e5f6c58f4cab936f27179b657f46.dDoiKNZCDNzDH1vU',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
  model: 'GLM-4.7-Flash',
  maxTokens: 4096,
  temperature: 0.7,
};
```

### 8.2 系统提示词

位于 `OpenAIService.ts`，定义 AI 助手的系统角色和可用命令列表。

### 8.3 路径常量

| 路径 | 用途 |
|------|------|
| `~/.hen/registry.json` | 注册表配置 |
| `~/.hen/git-projects/` | Git 克隆项目 |

---

## 9. 核心接口契约

### 9.1 ICliModule

CLI 子模块必须实现此接口：

```typescript
export interface ICliModule {
  readonly meta: CliMetaInfo;           // 模块元信息
  register(command: Command): void;     // 注册子命令
  dispose?(): void;                     // 清理资源（可选）
}
```

### 9.2 ICliRegistry

```typescript
export interface ICliRegistry {
  add(project: CliProject): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  get(key: string): CliProject | undefined;
  getAll(): CliProject[];
  has(key: string): boolean;
  reload(key: string): Promise<boolean>;
  linkToGlobal(project: CliProject): Promise<void>;
  unlinkFromGlobal(project: CliProject): Promise<void>;
}
```

### 9.3 IModuleLoader

```typescript
export interface IModuleLoader {
  load(project: CliProject): Promise<ICliModule>;
  unload(key: string): Promise<void>;
  reload(project: CliProject): Promise<ICliModule>;
}
```

### 9.4 IProjectScanner

```typescript
export interface IProjectScanner {
  scanDirectory(dir: string): Promise<CliProject[]>;
  scanDirectories(dirs: string[]): Promise<CliProject[]>;
}
```

### 9.5 IGitInstaller

```typescript
export interface IGitInstaller {
  clone(url: string, targetDir: string, options?: GitInstallOptions): Promise<string>;
  validateRepo(url: string): Promise<boolean>;
  getRepoName(url: string): string;
}
```

### 9.6 IAIService

```typescript
export interface IAIService {
  chat(message: string, onChunk?: (chunk: string) => void): Promise<string>;
  chatStream(message: string): AsyncGenerator<string>;
  isConfigured(): boolean;
}
```

---

## 10. 测试指南

### 10.1 测试原则

- 对接口编程，便于 mock 和测试
- 核心业务逻辑（core/）应有单元测试
- 命令类可以通过集成测试验证

### 10.2 Mock 示例

```typescript
// Mock ICliRegistry
const mockRegistry: ICliRegistry = {
  add: async () => true,
  remove: async () => true,
  get: () => undefined,
  getAll: () => [],
  has: () => false,
  reload: async () => true,
  linkToGlobal: async () => {},
  unlinkFromGlobal: async () => {},
};
```

---

## 11. 性能和最佳实践

### 11.1 模块加载优化

- 使用 `pathToFileURL` 加载动态模块，支持 Windows 路径
- 添加时间戳参数避免缓存：`import(`${entryPath}?t=${Date.now()}`)`

### 11.2 错误恢复

- 非关键操作失败不应阻止主流程
- 使用 try-catch 包裹可选操作
- 记录警告而非抛出异常

### 11.3 资源管理

- CLI 模块可以提供 `dispose()` 方法清理资源
- 删除模块时调用 `dispose()`

---

## 12. 注意事项

### 12.1 必须遵守

1. **始终使用 `.js` 后缀导入 TypeScript 文件**
2. **不要手动修改 `dist/` 目录**
3. **保持 strict TypeScript 模式**
4. **依赖接口而非具体实现**
5. **命令必须继承 `BaseCommand`**
6. **使用 `.trae/specs/` 目录管理功能开发流程**

### 12.2 避免

1. 不要在源文件中使用 CommonJS `require()`
2. 不要跳过错误处理
3. 不要直接在 `index.ts` 中实现命令逻辑
4. 不要硬编码路径，使用 `path.resolve()` 或 `os.homedir()`

---

## 13. AI Agent 协作规范

### 13.1 Spec 驱动开发

项目使用 `.trae/specs/` 目录管理功能开发：

```
.trae/specs/<change-id>/
├── spec.md        # 功能规格
├── tasks.md       # 任务列表
└── checklist.md   # 验收检查表
```

### 13.2 工作流程

1. 检查 `.trae/specs/` 是否有相关未完成的 spec
2. 如果没有，创建新的 spec（使用动词前缀的 change-id）
3. 编写 `spec.md`、`tasks.md`、`checklist.md`
4. 获得用户批准后按 `tasks.md` 实现
5. 按 `checklist.md` 验证
6. 完成后标记所有任务为完成

### 13.3 协作原则

- 每次开发前检查是否有冲突的 spec
- 保持功能独立，避免跨模块耦合
- 修改现有代码时保持向后兼容

---

## 14. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-06-11 | 初始版本，核心功能 + 全局链接 |

---

## 15. 常见问题

### Q: 为什么导入要用 `.js` 后缀？
A: TypeScript 编译为 ES 模块时不会自动添加扩展名，运行时需要完整的 `.js` 路径。

### Q: 如何调试？
A: 使用 `npm run hen -- <command>` 可以直接运行 `.ts` 文件，无需先编译。

### Q: 如何添加新的子命令？
A: 继承 `BaseCommand`，实现抽象方法，在 `CommandFactory` 中注册。

### Q: 全局链接是什么？
A: 通过 `npm link` 将 CLI 模块链接到全局，使其可以直接在命令行调用，无需通过 `hen <子命令>`。
