import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import {
  FILE_SYSTEM_PORT,
  FileSystemPort,
} from '../../domain/ports/file-system.port';
import { SourcePathGuard } from '../../domain/services/source-path-guard.service';

export type FileContentType = 'markdown' | 'html';

export interface FileContentResult {
  content: string;
  type: FileContentType;
}

const EXTENSION_TYPE_MAP: Record<string, FileContentType> = {
  '.md': 'markdown',
  '.html': 'html',
};

@Injectable()
export class GetFileContentUseCase {
  constructor(
    @Inject(FILE_SYSTEM_PORT)
    private readonly fileSystemPort: FileSystemPort,
    private readonly sourcePathGuard: SourcePathGuard,
  ) {}

  async execute(requestedPath: string): Promise<FileContentResult> {
    if (!requestedPath) {
      throw new BadRequestException('path query parameter is required');
    }

    const resolvedPath = path.resolve(requestedPath);

    const extension = path.extname(resolvedPath).toLowerCase();
    const type = EXTENSION_TYPE_MAP[extension];
    if (!type) {
      throw new BadRequestException(
        `Unsupported file type: ${extension || '(none)'}`,
      );
    }

    await this.sourcePathGuard.assertWithinRegisteredSource(resolvedPath);

    let content: string;
    try {
      content = await this.fileSystemPort.readFile(resolvedPath);
    } catch {
      throw new NotFoundException(`File not found: ${resolvedPath}`);
    }

    return { content, type };
  }
}
