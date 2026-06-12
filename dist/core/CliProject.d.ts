import { CliMetaInfo, ProjectSource, SerializedProject } from '../types.js';
import { ICliModule } from '../interfaces/ICliModule.js';
export declare class CliProject {
    private readonly _key;
    private readonly _name;
    private readonly _path;
    private readonly _source;
    private readonly _version?;
    private readonly _description?;
    private readonly _gitUrl?;
    private readonly _globalLink;
    private readonly _installed;
    private _module?;
    constructor(key: string, name: string, projectPath: string, source: ProjectSource, version?: string, description?: string, gitUrl?: string, globalLink?: boolean, installed?: boolean);
    static fromSerialized(data: SerializedProject): CliProject;
    get key(): string;
    get name(): string;
    get path(): string;
    get source(): ProjectSource;
    get version(): string | undefined;
    get description(): string | undefined;
    get gitUrl(): string | undefined;
    get globalLink(): boolean;
    get installed(): boolean;
    get module(): ICliModule | undefined;
    get entryPath(): string;
    get meta(): CliMetaInfo;
    setModule(module: ICliModule): void;
    clearModule(): void;
    serialize(): SerializedProject;
}
//# sourceMappingURL=CliProject.d.ts.map