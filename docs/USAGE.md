# Hen CLI 管理工具使用文档

Hen 是一个基于 TypeScript 的 CLI 项目管理工具，帮助你统一管理多个 CLI 项目。支持本地和 Git 远程项目的添加、删除、列表查看、重载以及 AI 智能问答。

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd CLI2

# 安装依赖
npm install

# 构建项目
npm run build

# 全局使用（可选）
npm link
```

## 快速开始

```bash
# 查看帮助
hen --help

# 查看版本
hen --version
```

## 命令说明

### 1. 添加 CLI 项目 (`hen add`)

支持三种方式添加 CLI 项目：

#### 添加本地项目（指定路径）

```bash
# 添加单个 CLI 项目
hen add /path/to/cli-project

# 添加包含多个 CLI 项目的目录
hen add /path/to/cli-projects
```

CLI 项目的识别标准：目录中包含 `index.ts` 入口文件。

#### 添加 Git 远程项目

```bash
# 从 Git 仓库添加（默认主分支）
hen add --git https://github.com/user/cli-project.git

# 指定分支
hen add --git https://github.com/user/cli-project.git --branch develop
```

#### 交互式添加

```bash
# 不传参数，进入交互模式
hen add
```

### 2. 列出 CLI 项目 (`hen list`)

```bash
# 查看所有已注册的 CLI 项目
hen list

# 按类型筛选
hen list --type local    # 仅显示本地项目
hen list --type git      # 仅显示 Git 远程项目

# 显示详细信息
hen list --verbose
```

输出示例：
```
┌  Hen CLI - 项目列表
│
◇  共 1 个项目 ─────────────────────────────────╮
│                                           │
│  📁 本地    example              示例 CLI 项目  │
│                                           │
├───────────────────────────────────────────╯
│
└  完成
```

### 3. 删除 CLI 项目 (`hen remove`)

```bash
# 交互式选择删除
hen remove

# 直接指定项目 key 删除
hen remove example
```

删除前会进行确认，确保不会误删。

### 4. 重载 CLI 项目 (`hen reload`)

```bash
# 交互式选择重载
hen reload

# 直接指定项目 key 重载
hen reload example
```

重载会重新加载项目的配置和模块，适用于项目代码更新后。

### 5. AI 问答 (`hen ai`)

基于 GLM-4.7-Flash 模型的智能问答功能，支持流式输出。

```bash
# 直接提问
hen ai "如何添加 CLI 项目？"

# 交互式提问
hen ai
```

AI 会提供关于 Hen CLI 使用、项目管理和相关技术问题的帮助。

## 项目结构

```
CLI2/
├── src/
│   ├── commands/          # 命令实现
│   │   ├── BaseCommand.ts
│   │   ├── AddCommand.ts
│   │   ├── RemoveCommand.ts
│   │   ├── ListCommand.ts
│   │   ├── ReloadCommand.ts
│   │   └── AiCommand.ts
│   ├── core/              # 核心服务
│   │   ├── CliProject.ts
│   │   ├── CliRegistry.ts
│   │   ├── ConfigManager.ts
│   │   ├── ProjectScanner.ts
│   │   └── GitManager.ts
│   ├── services/          # 外部服务
│   │   └── AiService.ts
│   ├── interfaces/        # 接口定义
│   │   ├── ICliProject.ts
│   │   ├── ICliRegistry.ts
│   │   └── IConfigManager.ts
│   └── index.ts           # 入口文件
├── cli-projects/          # CLI 项目存储目录
│   └── example/           # 示例项目
├── package.json
└── tsconfig.json
```

## 配置

配置文件位于 `~/.hen/config.json`，包含：

- 已注册的 CLI 项目列表
- 项目元数据（名称、路径、类型等）
- AI 服务配置

## 开发指南

### 添加新命令

1. 在 `src/commands/` 下创建新命令类
2. 继承 `BaseCommand` 并实现 `createCommand()` 方法
3. 在 `src/index.ts` 中注册新命令

### 扩展核心服务

所有核心服务通过接口定义契约，便于替换和扩展：

- `ICliRegistry` - 项目注册表
- `IConfigManager` - 配置管理
- `IProjectScanner` - 项目扫描

## 常见问题

### Q: 如何判断一个目录是否是有效的 CLI 项目？

A: 检查目录中是否包含 `index.ts` 入口文件。

### Q: Git 远程项目支持哪些仓库？

A: 支持任何可访问的 Git 仓库（GitHub、GitLab、Gitee 等），只要包含 `index.ts` 入口文件。

### Q: AI 问答使用的是什么模型？

A: 使用智谱 AI 的 GLM-4.7-Flash 模型，支持流式输出。

### Q: 如何更新已添加的 CLI 项目？

A: 使用 `hen reload <key>` 重新加载项目，或先删除再重新添加。

## 许可证

MIT
