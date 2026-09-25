import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FileNode } from '../../domain/entities/file-node.entity';
import { Source } from '../../domain/entities/source.entity';
import {
  SOURCE_CONFIG_PORT,
  SourceConfigPort,
} from '../../domain/ports/source-config.port';
import {
  FILE_SYSTEM_PORT,
  FileSystemPort,
} from '../../domain/ports/file-system.port';

export interface SourceTreeResult {
  source: Source;
  tree: FileNode[];
}

@Injectable()
export class GetSourceTreeUseCase {
  constructor(
    @Inject(SOURCE_CONFIG_PORT)
    private readonly sourceConfigPort: SourceConfigPort,
    @Inject(FILE_SYSTEM_PORT)
    private readonly fileSystemPort: FileSystemPort,
  ) {}

  async execute(sourceId: string): Promise<SourceTreeResult> {
    const source = await this.sourceConfigPort.findById(sourceId);
    if (!source) {
      throw new NotFoundException(`Source not found: ${sourceId}`);
    }

    const tree = await this.fileSystemPort.scanDirectory(source.path);
    return { source, tree };
  }
}
