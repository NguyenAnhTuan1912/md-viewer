import { FileExplorerNotFoundError } from '../../domain/errors/file-explorer.errors';
import { FileNode } from '../../domain/entities/file-node.entity';
import { Source } from '../../domain/entities/source.entity';
import { SourceRepository } from '../ports/source.repository';
import { FileSystemPort } from '../ports/file-system.port';

export interface SourceTreeResult {
  source: Source;
  tree: FileNode[];
}

export class GetSourceTreeUseCase {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly fileSystemPort: FileSystemPort,
  ) {}

  async execute(sourceId: string): Promise<SourceTreeResult> {
    const source = await this.sourceRepository.findById(sourceId);
    if (!source) {
      throw new FileExplorerNotFoundError(`Source not found: ${sourceId}`);
    }

    const tree = await this.fileSystemPort.scanDirectory(source.path);
    return { source, tree };
  }
}
