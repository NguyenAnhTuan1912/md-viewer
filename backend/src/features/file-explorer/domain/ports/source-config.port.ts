import { Source } from '../entities/source.entity';

export const SOURCE_CONFIG_PORT = Symbol('SOURCE_CONFIG_PORT');

/**
 * Port for persisting and retrieving the list of registered Sources
 * (root folders) from a configuration store.
 */
export interface SourceConfigPort {
  listAll(): Promise<Source[]>;
  findById(id: string): Promise<Source | null>;
  add(source: Source): Promise<void>;
}
