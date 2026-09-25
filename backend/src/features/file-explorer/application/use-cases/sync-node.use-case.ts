import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import { FileNode } from '../../domain/entities/file-node.entity';
import {
  FILE_SYSTEM_PORT,
  FileSystemPort,
} from '../../domain/ports/file-system.port';
import { SourcePathGuard } from '../../domain/services/source-path-guard.service';

@Injectable()
export class SyncNodeUseCase {
  constructor(
    @Inject(FILE_SYSTEM_PORT)
    private readonly fileSystemPort: FileSystemPort,
    private readonly sourcePathGuard: SourcePathGuard,
  ) {}

  async execute(requestedPath: string): Promise<FileNode[]> {
    if (!requestedPath) {
      throw new BadRequestException('path is required');
    }

    const resolvedPath = path.resolve(requestedPath);
    await this.sourcePathGuard.assertWithinRegisteredSource(resolvedPath);

    return this.fileSystemPort.scanDirectory(resolvedPath);
  }
}
