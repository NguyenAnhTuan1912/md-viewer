import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { AddSourceUseCase } from './add-source.use-case';
import { SourceConfigPort } from '../../domain/ports/source-config.port';
import { Source } from '../../domain/entities/source.entity';

describe('AddSourceUseCase', () => {
  let realDir: string;
  let mockPort: jest.Mocked<SourceConfigPort>;
  let useCase: AddSourceUseCase;

  beforeEach(async () => {
    realDir = await fs.mkdtemp(path.join(os.tmpdir(), 'add-source-test-'));
    mockPort = {
      listAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      add: jest.fn().mockResolvedValue(undefined),
    };
    useCase = new AddSourceUseCase(mockPort);
  });

  afterEach(async () => {
    await fs.rm(realDir, { recursive: true, force: true });
  });

  it('adds a source when the path exists and is a directory', async () => {
    const result = await useCase.execute({ path: realDir });

    expect(result.path).toBe(path.resolve(realDir));
    expect(result.name).toBe(path.basename(realDir));
    expect(mockPort.add).toHaveBeenCalledTimes(1);
  });

  it('uses provided name over basename when given', async () => {
    const result = await useCase.execute({ path: realDir, name: 'My Docs' });
    expect(result.name).toBe('My Docs');
  });

  it('throws BadRequestException when path does not exist', async () => {
    const missingPath = path.join(realDir, 'does-not-exist');
    await expect(useCase.execute({ path: missingPath })).rejects.toThrow(
      BadRequestException,
    );
    expect(mockPort.add).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when path is a file, not a directory', async () => {
    const filePath = path.join(realDir, 'file.txt');
    await fs.writeFile(filePath, 'hello');

    await expect(useCase.execute({ path: filePath })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException when folder is already added', async () => {
    const resolved = path.resolve(realDir);
    mockPort.listAll.mockResolvedValue([Source.create(resolved, 'existing')]);

    await expect(useCase.execute({ path: realDir })).rejects.toThrow(
      BadRequestException,
    );
    expect(mockPort.add).not.toHaveBeenCalled();
  });
});
