import { InvalidFileExplorerInputError } from '../../domain/errors/file-explorer.errors';
import { FileSystemPort } from '../ports/file-system.port';
import * as path from 'path';
import { Source } from '../../domain/entities/source.entity';
import { SourceRepository } from '../ports/source.repository';

export interface AddSourceInput {
  path: string;
  name?: string;
}

export class AddSourceUseCase {
  constructor(
    private readonly sourceRepo: SourceRepository,
    private readonly fileSystemPort: FileSystemPort,
  ) {}

  async execute(input: AddSourceInput): Promise<Source> {
    const resolvedPath = path.resolve(input.path);

    let isDirectory: boolean;
    try {
      isDirectory = await this.fileSystemPort.isDirectory(resolvedPath);
    } catch {
      throw new InvalidFileExplorerInputError(
        `Path does not exist: ${resolvedPath}`,
      );
    }

    if (!isDirectory) {
      throw new InvalidFileExplorerInputError(
        `Path is not a directory: ${resolvedPath}`,
      );
    }

    const existing = await this.sourceRepo.listAll();
    const alreadyAdded = existing.some((s) => s.path === resolvedPath);
    if (alreadyAdded) {
      throw new InvalidFileExplorerInputError(
        `Folder already added: ${resolvedPath}`,
      );
    }

    const name = input.name?.trim() || path.basename(resolvedPath);
    const source = Source.create(resolvedPath, name);
    await this.sourceRepo.add(source);
    return source;
  }
}
