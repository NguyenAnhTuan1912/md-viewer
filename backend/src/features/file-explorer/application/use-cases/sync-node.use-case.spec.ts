import { BadRequestException } from '@nestjs/common';
import { SyncNodeUseCase } from './sync-node.use-case';
import { FileSystemPort } from '../../domain/ports/file-system.port';
import { SourcePathGuard } from '../../domain/services/source-path-guard.service';
import { FileNode } from '../../domain/entities/file-node.entity';

describe('SyncNodeUseCase', () => {
  let mockFsPort: jest.Mocked<FileSystemPort>;
  let mockGuard: jest.Mocked<SourcePathGuard>;
  let useCase: SyncNodeUseCase;

  beforeEach(() => {
    mockFsPort = {
      scanDirectory: jest.fn(),
      readFile: jest.fn(),
    };
    mockGuard = {
      assertWithinRegisteredSource: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SourcePathGuard>;
    useCase = new SyncNodeUseCase(mockFsPort, mockGuard);
  });

  it('throws BadRequestException when path is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });

  it('validates the path via the guard before scanning', async () => {
    mockFsPort.scanDirectory.mockResolvedValue([]);
    await useCase.execute('/tmp/demo-docs/guides');
    expect(mockGuard.assertWithinRegisteredSource).toHaveBeenCalled();
  });

  it('returns the freshly scanned sub-tree', async () => {
    const freshNodes = [
      FileNode.file('new-file.md', '/tmp/demo-docs/guides/new-file.md', '.md'),
    ];
    mockFsPort.scanDirectory.mockResolvedValue(freshNodes);

    const result = await useCase.execute('/tmp/demo-docs/guides');
    expect(result).toBe(freshNodes);
  });

  it('propagates rejection from the guard without scanning', async () => {
    mockGuard.assertWithinRegisteredSource.mockRejectedValue(
      new Error('forbidden'),
    );
    await expect(useCase.execute('/etc')).rejects.toThrow('forbidden');
    expect(mockFsPort.scanDirectory).not.toHaveBeenCalled();
  });
});
