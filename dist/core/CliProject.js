import path from 'path';
export class CliProject {
    _key;
    _name;
    _path;
    _source;
    _version;
    _description;
    _gitUrl;
    _globalLink;
    _installed;
    _module;
    constructor(key, name, projectPath, source, version, description, gitUrl, globalLink = false, installed = false) {
        this._key = key;
        this._name = name;
        this._path = projectPath;
        this._source = source;
        this._version = version;
        this._description = description;
        this._gitUrl = gitUrl;
        this._globalLink = globalLink;
        this._installed = installed;
    }
    static fromSerialized(data) {
        return new CliProject(data.key, data.name, data.path, data.source, data.version, data.description, data.gitUrl, data.globalLink, data.installed);
    }
    get key() {
        return this._key;
    }
    get name() {
        return this._name;
    }
    get path() {
        return this._path;
    }
    get source() {
        return this._source;
    }
    get version() {
        return this._version;
    }
    get description() {
        return this._description;
    }
    get gitUrl() {
        return this._gitUrl;
    }
    get globalLink() {
        return this._globalLink;
    }
    get installed() {
        return this._installed;
    }
    get module() {
        return this._module;
    }
    get entryPath() {
        return path.join(this._path, 'index.ts');
    }
    get meta() {
        return {
            key: this._key,
            name: this._name,
            version: this._version,
            description: this._description,
        };
    }
    setModule(module) {
        this._module = module;
    }
    clearModule() {
        this._module = undefined;
    }
    serialize() {
        return {
            key: this._key,
            name: this._name,
            path: this._path,
            version: this._version,
            description: this._description,
            source: this._source,
            gitUrl: this._gitUrl,
            globalLink: this._globalLink || undefined,
            installed: this._installed || undefined,
        };
    }
}
//# sourceMappingURL=CliProject.js.map