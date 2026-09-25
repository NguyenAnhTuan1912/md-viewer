import { Inject, Injectable } from '@nestjs/common';
import { Source } from '../../domain/entities/source.entity';
import {
  SOURCE_CONFIG_PORT,
  SourceConfigPort,
} from '../../domain/ports/source-config.port';

@Injectable()
export class ListSourcesUseCase {
  constructor(
    @Inject(SOURCE_CONFIG_PORT)
    private readonly sourceConfigPort: SourceConfigPort,
  ) {}

  async execute(): Promise<Source[]> {
    return this.sourceConfigPort.listAll();
  }
}
