export const cliMeta = {
  key: 'pack-cli',
  name: 'pack-cli',
  version: '1.0.0',
  description: '将 TS/JS 文件打包成 Hen CLI 项目',
};

export function register(program: any): void {
  program
    .command('pack')
    .description('打包一个 TS/JS 文件为 CLI 项目')
    .requiredOption('-n, --name <name>', '包名/调用名/生成的文件夹名')
    .requiredOption('-i, --input <file>', '需要打包的文件入口 (xxx.ts/xxx.js)')
    .option('-o, --output <dir>', '输出目录 (默认: ~/.hen/projects)')
    .action(async (options: Record<string, unknown>) => {
      const { packCommand } = await import('./src/index.js') as any;
      await packCommand(options as any);
    });
}

export function dispose(): void {
  // Cleanup if needed
}
