import { Command } from 'commander';
import { ICliRegistry } from '../interfaces/ICliRegistry.js';

export abstract class BaseCommand {
  protected readonly _registry: ICliRegistry;

  constructor(registry: ICliRegistry) {
    this._registry = registry;
  }

  abstract get name(): string;
  abstract get description(): string;
  abstract createCommand(): Command;
}
