import { FileExplorerNotFoundError } from '../../domain/errors/file-explorer.errors';
import { GetSourceTreeUseCase } from './get-source-tree.use-case';
import { SourceRepository } from '../ports/source.repository';
import { FileSystemPort } from '../ports/file-system.port';
import { Source } from '../../domain/entities/source.entity';
import { FileNode } from '../../domain/entities/file-node.entity';

describe('GetSourceTreeUseCase', () => {
  let mockConfigPort: jest.Mocked<SourceRepository>;
  let mockFsPort: jest.Mocked<FileSystemPort>;
  let useCase: GetSourceTreeUseCase;

  beforeEach(() => {
    mockConfigPort = {
      listAll: jest.fn(),
      findById: jest.fn(),
      add: jest.fn(),
    };
    mockFsPort = {
      isDirectory: jest.fn(),
      scanDirectory: jest.fn(),
      readFile: jest.fn(),
      readFileBuffer: jest.fn(),
    };
    useCase = new GetSourceTreeUseCase(mockConfigPort, mockFsPort);
  });

  it('throws FileExplorerNotFoundError when source does not exist', async () => {
    mockConfigPort.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing-id')).rejects.toThrow(
      FileExplorerNotFoundError,
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
