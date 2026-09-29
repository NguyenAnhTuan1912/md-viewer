import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GetFileAssetUseCase } from './get-file-asset.use-case';
import { FileSystemPort } from '../../domain/ports/file-system.port';
import { SourcePathGuard } from '../../domain/services/source-path-guard.service';

describe('GetFileAssetUseCase', () => {
  let mockFsPort: jest.Mocked<FileSystemPort>;
  let mockGuard: jest.Mocked<SourcePathGuard>;
  let useCase: GetFileAssetUseCase;

  beforeEach(() => {
    mockFsPort = {
      scanDirectory: jest.fn(),
      readFile: jest.fn(),
      readFileBuffer: jest.fn(),
    };
    mockGuard = {
      assertWithinRegisteredSource: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SourcePathGuard>;
    useCase = new GetFileAssetUseCase(mockFsPort, mockGuard);
  });

  it('throws BadRequestException when path is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });

  it('returns the file buffer with the correct content type for a .png', async () => {
    const buffer = Buffer.from([1, 2, 3]);
    mockFsPort.readFileBuffer.mockResolvedValue(buffer);
    const result = await useCase.execute('/tmp/demo/images/logo.png');
    expect(result).toEqual({ buffer, contentType: 'image/png' });
    expect(mockGuard.assertWithinRegisteredSource).toHaveBeenCalled();
  });

  it('returns the correct content type for a .svg', async () => {
    mockFsPort.readFileBuffer.mockResolvedValue(Buffer.from('<svg/>'));
    const result = await useCase.execute('/tmp/demo/icon.svg');
    expect(result.contentType).toBe('image/svg+xml');
  });

  it('falls back to application/octet-stream for unknown extensions', async () => {
    mockFsPort.readFileBuffer.mockResolvedValue(Buffer.from('data'));
    const result = await useCase.execute('/tmp/demo/file.unknownext');
    expect(result.contentType).toBe('application/octet-stream');
  });

  it('does not restrict by .md/.html extension (allows arbitrary asset types)', async () => {
    mockFsPort.readFileBuffer.mockResolvedValue(Buffer.from('body{}'));
    const result = await useCase.execute('/tmp/demo/styles/main.css');
    expect(result.contentType).toBe('text/css');
  });

  it('propagates path traversal rejection from the guard', async () => {
    mockGuard.assertWithinRegisteredSource.mockRejectedValue(
      new Error('forbidden'),
    );
    await expect(useCase.execute('/etc/passwd')).rejects.toThrow('forbidden');
    expect(mockFsPort.readFileBuffer).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the underlying file read fails', async () => {
    mockFsPort.readFileBuffer.mockRejectedValue(new Error('ENOENT'));
    await expect(
      useCase.execute('/tmp/demo/missing.png'),
    ).rejects.toThrow(NotFoundException);
  });
});
