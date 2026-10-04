import { Source } from '../../domain/entities/source.entity';

/**
 * Port for persisting and retrieving the list of registered Sources
 * (root folders) from a configuration store.
 */
export interface SourceRepository {
  listAll(): Promise<Source[]>;
  findById(id: string): Promise<Source | null>;
  add(source: Source): Promise<void>;
}
