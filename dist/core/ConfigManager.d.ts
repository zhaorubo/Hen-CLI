import { AiConfig, SerializedProject } from '../types.js';
export declare class ConfigManager {
    private readonly _configPath;
    private _registry;
    constructor(configPath?: string);
    get scanDirs(): readonly string[];
    get projectsDir(): string;
    get projects(): readonly SerializedProject[];
    get aiConfig(): AiConfig;
    init(): Promise<void>;
    addScanDir(dir: string): Promise<void>;
    addProject(project: SerializedProject): Promise<void>;
    removeProject(key: string): Promise<void>;
    updateProject(project: SerializedProject): Promise<void>;
    updateAiConfig(config: Partial<AiConfig>): Promise<void>;
    save(): Promise<void>;
    reload(): Promise<void>;
}
//# sourceMappingURL=ConfigManager.d.ts.map