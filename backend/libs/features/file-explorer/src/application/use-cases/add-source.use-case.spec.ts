import * as path from 'node:path';
import { InvalidFileExplorerInputError } from '../../domain/errors/file-explorer.errors';
import { AddSourceUseCase } from './add-source.use-case';
import { SourceRepository } from '../ports/source.repository';
import { FileSystemPort } from '../ports/file-system.port';
import { Source } from '../../domain/entities/source.entity';

describe('AddSourceUseCase', () => {
  const sourcePath = '/tmp/demo-docs';
  let mockPort: jest.Mocked<SourceRepository>;
  let mockFs: jest.Mocked<FileSystemPort>;
  let useCase: AddSourceUseCase;

  beforeEach(() => {
    mockPort = {
      listAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      add: jest.fn().mockResolvedValue(undefined),
    };
    mockFs = {
      isDirectory: jest.fn().mockResolvedValue(true),
      scanDirectory: jest.fn(),
      readFile: jest.fn(),
      readFileBuffer: jest.fn(),
    };
    useCase = new AddSourceUseCase(mockPort, mockFs);
  });

  it('adds a source when the filesystem port confirms a directory', async () => {
    const result = await useCase.execute({ path: sourcePath });
    expect(result.path).toBe(path.resolve(sourcePath));
    expect(result.name).toBe(path.basename(sourcePath));
    expect(mockFs.isDirectory).toHaveBeenCalledWith(path.resolve(sourcePath));
    expect(mockPort.add).toHaveBeenCalledWith(result);
  });

  it('uses a trimmed provided name', async () => {
    const result = await useCase.execute({
      path: sourcePath,
      name: ' My Docs ',
    });
    expect(result.name).toBe('My Docs');
  });

  it('rejects a missing path without saving a source', async () => {
    mockFs.isDirectory.mockRejectedValue(new Error('ENOENT'));
    await expect(useCase.execute({ path: sourcePath })).rejects.toThrow(
      new InvalidFileExplorerInputError(`Path does not exist: ${sourcePath}`),
    );
    expect(mockPort.add).not.toHaveBeenCalled();
  });

  it('rejects a file instead of a directory', async () => {
    mockFs.isDirectory.mockResolvedValue(false);
    await expect(useCase.execute({ path: sourcePath })).rejects.toThrow(
      new InvalidFileExplorerInputError(
        `Path is not a directory: ${sourcePath}`,
      ),
    );
    expect(mockPort.add).not.toHaveBeenCalled();
  });

  it('rejects an already registered source', async () => {
    mockPort.listAll.mockResolvedValue([Source.create(sourcePath, 'existing')]);
    await expect(useCase.execute({ path: sourcePath })).rejects.toThrow(
      new InvalidFileExplorerInputError(`Folder already added: ${sourcePath}`),
    );
    expect(mockPort.add).not.toHaveBeenCalled();
  });
});
