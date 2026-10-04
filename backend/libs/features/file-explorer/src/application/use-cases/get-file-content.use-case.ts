import {
  InvalidFileExplorerInputError,
  FileExplorerNotFoundError,
} from '../../domain/errors/file-explorer.errors';
import * as path from 'path';
import { FileSystemPort } from '../ports/file-system.port';
import { SourcePathGuard } from '../services/source-path-guard.service';

export type FileContentType = 'markdown' | 'html';

export interface FileContentResult {
  content: string;
  type: FileContentType;
}

const EXTENSION_TYPE_MAP: Record<string, FileContentType> = {
  '.md': 'markdown',
  '.html': 'html',
};

export class GetFileContentUseCase {
  constructor(
    private readonly fileSystemPort: FileSystemPort,
    private readonly sourcePathGuard: SourcePathGuard,
  ) {}

  async execute(requestedPath: string): Promise<FileContentResult> {
    if (!requestedPath) {
      throw new InvalidFileExplorerInputError(
        'path query parameter is required',
      );
    }

    const resolvedPath = path.resolve(requestedPath);

    const extension = path.extname(resolvedPath).toLowerCase();
    const type = EXTENSION_TYPE_MAP[extension];
    if (!type) {
      throw new InvalidFileExplorerInputError(
        `Unsupported file type: ${extension || '(none)'}`,
      );
    }

    await this.sourcePathGuard.assertWithinRegisteredSource(resolvedPath);

    let content: string;
    try {
      content = await this.fileSystemPort.readFile(resolvedPath);
    } catch {
      throw new FileExplorerNotFoundError(`File not found: ${resolvedPath}`);
    }

    return { content, type };
  }
}
