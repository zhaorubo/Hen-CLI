export const cliMeta = {
  key: 'example',
  name: '示例 CLI 项目',
  version: '1.0.0',
  description: '一个示例的 CLI 项目',
};

export function register(program: any): void {
  program
    .command('example:hello')
    .description('示例命令')
    .action(() => {
      console.log('Hello from example CLI project!');
    });
}

export function dispose(): void {
  // Cleanup if needed
}
