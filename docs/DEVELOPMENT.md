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

## 4. 编码规范

### 4.1 TypeScript 配置要求

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
