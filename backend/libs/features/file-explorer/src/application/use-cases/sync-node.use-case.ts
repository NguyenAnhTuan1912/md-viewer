import { InvalidFileExplorerInputError } from '../../domain/errors/file-explorer.errors';
import * as path from 'path';
import { FileNode } from '../../domain/entities/file-node.entity';
import { FileSystemPort } from '../ports/file-system.port';
import { SourcePathGuard } from '../services/source-path-guard.service';

export class SyncNodeUseCase {
  constructor(
    private readonly fileSystemPort: FileSystemPort,
    private readonly sourcePathGuard: SourcePathGuard,
  ) {}

  async execute(requestedPath: string): Promise<FileNode[]> {
    if (!requestedPath) {
      throw new InvalidFileExplorerInputError('path is required');
    }

    const resolvedPath = path.resolve(requestedPath);
    await this.sourcePathGuard.assertWithinRegisteredSource(resolvedPath);

    return this.fileSystemPort.scanDirectory(resolvedPath);
  }
}
