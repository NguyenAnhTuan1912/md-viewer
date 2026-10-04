import { Source } from '../../domain/entities/source.entity';
import { SourceRepository } from '../ports/source.repository';

export class ListSourcesUseCase {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(): Promise<Source[]> {
    return this.sourceRepository.listAll();
  }
}
