import { CliMetaInfo, ProjectSource, SerializedProject } from '../types.js';
import { ICliModule } from '../interfaces/ICliModule.js';
import path from 'path';

export class CliProject {
  private readonly _key: string;
  private readonly _name: string;
  private readonly _path: string;
  private readonly _source: ProjectSource;
  private readonly _version?: string;
  private readonly _description?: string;
  private readonly _gitUrl?: string;
  private readonly _globalLink: boolean;
  private _module?: ICliModule;

  constructor(
    key: string,
    name: string,
    projectPath: string,
    source: ProjectSource,
    version?: string,
    description?: string,
    gitUrl?: string,
    globalLink: boolean = false
  ) {
    this._key = key;
    this._name = name;
    this._path = projectPath;
    this._source = source;
    this._version = version;
    this._description = description;
    this._gitUrl = gitUrl;
    this._globalLink = globalLink;
  }

  static fromSerialized(data: SerializedProject): CliProject {
    return new CliProject(
      data.key,
      data.name,
      data.path,
      data.source,
      data.version,
      data.description,
      data.gitUrl,
      data.globalLink
    );
  }

  get key(): string {
    return this._key;
  }

  get name(): string {
    return this._name;
  }

  get path(): string {
    return this._path;
  }

  get source(): ProjectSource {
    return this._source;
  }

  get version(): string | undefined {
    return this._version;
  }

  get description(): string | undefined {
    return this._description;
  }

  get gitUrl(): string | undefined {
    return this._gitUrl;
  }

  get globalLink(): boolean {
    return this._globalLink;
  }

  get module(): ICliModule | undefined {
    return this._module;
  }

  get entryPath(): string {
    return path.join(this._path, 'index.ts');
  }

  get meta(): CliMetaInfo {
    return {
      key: this._key,
      name: this._name,
      version: this._version,
      description: this._description,
    };
  }

  setModule(module: ICliModule): void {
    this._module = module;
  }

  clearModule(): void {
    this._module = undefined;
  }

  serialize(): SerializedProject {
    return {
      key: this._key,
      name: this._name,
      path: this._path,
      version: this._version,
      description: this._description,
      source: this._source,
      gitUrl: this._gitUrl,
      globalLink: this._globalLink || undefined,
    };
  }
}
