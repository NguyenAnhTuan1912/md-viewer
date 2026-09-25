import { NotFoundException } from '@nestjs/common';
import { GetSourceTreeUseCase } from './get-source-tree.use-case';
import { SourceConfigPort } from '../../domain/ports/source-config.port';
import { FileSystemPort } from '../../domain/ports/file-system.port';
import { Source } from '../../domain/entities/source.entity';
import { FileNode } from '../../domain/entities/file-node.entity';

describe('GetSourceTreeUseCase', () => {
  let mockConfigPort: jest.Mocked<SourceConfigPort>;
  let mockFsPort: jest.Mocked<FileSystemPort>;
  let useCase: GetSourceTreeUseCase;

  beforeEach(() => {
    mockConfigPort = {
      listAll: jest.fn(),
      findById: jest.fn(),
      add: jest.fn(),
    };
    mockFsPort = {
      scanDirectory: jest.fn(),
      readFile: jest.fn(),
    };
    useCase = new GetSourceTreeUseCase(mockConfigPort, mockFsPort);
  });

  it('throws NotFoundException when source does not exist', async () => {
    mockConfigPort.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('returns source and scanned tree when source exists', async () => {
    const source = Source.create('/some/path', 'my-docs');
    const tree = [FileNode.file('readme.md', '/some/path/readme.md', '.md')];

    mockConfigPort.findById.mockResolvedValue(source);
    mockFsPort.scanDirectory.mockResolvedValue(tree);

    const result = await useCase.execute(source.id);

    expect(result.source).toBe(source);
    expect(result.tree).toBe(tree);
    expect(mockFsPort.scanDirectory).toHaveBeenCalledWith('/some/path');
  });
});
