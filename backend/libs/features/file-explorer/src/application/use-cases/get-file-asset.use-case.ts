import {
  InvalidFileExplorerInputError,
  FileExplorerNotFoundError,
} from '../../domain/errors/file-explorer.errors';
import * as path from 'path';
import { FileSystemPort } from '../ports/file-system.port';
import { SourcePathGuard } from '../services/source-path-guard.service';

export interface FileAssetResult {
  buffer: Buffer;
  contentType: string;
}

const MIME_TYPE_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
};

const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

export class GetFileAssetUseCase {
  constructor(
    private readonly fileSystemPort: FileSystemPort,
    private readonly sourcePathGuard: SourcePathGuard,
  ) {}

  async execute(requestedPath: string): Promise<FileAssetResult> {
    if (!requestedPath) {
      throw new InvalidFileExplorerInputError(
        'path query parameter is required',
      );
    }

    const resolvedPath = path.resolve(requestedPath);

    await this.sourcePathGuard.assertWithinRegisteredSource(resolvedPath);

    let buffer: Buffer;
    try {
      buffer = await this.fileSystemPort.readFileBuffer(resolvedPath);
    } catch {
      throw new FileExplorerNotFoundError(`File not found: ${resolvedPath}`);
    }

    const extension = path.extname(resolvedPath).toLowerCase();
    const contentType = MIME_TYPE_MAP[extension] ?? DEFAULT_CONTENT_TYPE;

    return { buffer, contentType };
  }
}
