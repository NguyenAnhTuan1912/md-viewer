import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { GetFileContentUseCase } from './get-file-content.use-case';
import { FileSystemPort } from '../../domain/ports/file-system.port';
import { SourcePathGuard } from '../../domain/services/source-path-guard.service';

describe('GetFileContentUseCase', () => {
  let mockFsPort: jest.Mocked<FileSystemPort>;
  let mockGuard: jest.Mocked<SourcePathGuard>;
  let useCase: GetFileContentUseCase;

  beforeEach(() => {
    mockFsPort = {
      scanDirectory: jest.fn(),
      readFile: jest.fn(),
      readFileBuffer: jest.fn(),
    };
    mockGuard = {
      assertWithinRegisteredSource: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SourcePathGuard>;
    useCase = new GetFileContentUseCase(mockFsPort, mockGuard);
  });

  it('throws BadRequestException when path is empty', async () => {
    await expect(useCase.execute('')).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException for unsupported file extension', async () => {
    await expect(useCase.execute('/tmp/demo/file.txt')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns markdown type and content for .md files', async () => {
    mockFsPort.readFile.mockResolvedValue('# Hello');
    const result = await useCase.execute('/tmp/demo/readme.md');
    expect(result).toEqual({ content: '# Hello', type: 'markdown' });
    expect(mockGuard.assertWithinRegisteredSource).toHaveBeenCalled();
  });

  it('returns html type and content for .html files', async () => {
    mockFsPort.readFile.mockResolvedValue('<h1>Hi</h1>');
    const result = await useCase.execute('/tmp/demo/page.html');
    expect(result).toEqual({ content: '<h1>Hi</h1>', type: 'html' });
  });

  it('propagates path traversal rejection from the guard', async () => {
    mockGuard.assertWithinRegisteredSource.mockRejectedValue(
      new Error('forbidden'),
    );
    await expect(useCase.execute('/etc/passwd.md')).rejects.toThrow(
      'forbidden',
    );
    expect(mockFsPort.readFile).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the underlying file read fails', async () => {
    mockFsPort.readFile.mockRejectedValue(new Error('ENOENT'));
    await expect(
      useCase.execute('/tmp/demo/missing.md'),
    ).rejects.toThrow(NotFoundException);
  });
});
