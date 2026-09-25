import { ForbiddenException } from '@nestjs/common';
import { SourcePathGuard } from './source-path-guard.service';
import { SourceConfigPort } from '../ports/source-config.port';
import { Source } from '../entities/source.entity';

describe('SourcePathGuard', () => {
  let mockPort: jest.Mocked<SourceConfigPort>;
  let guard: SourcePathGuard;

  beforeEach(() => {
    mockPort = {
      listAll: jest
        .fn()
        .mockResolvedValue([Source.create('/tmp/demo-docs', 'demo-docs')]),
      findById: jest.fn(),
      add: jest.fn(),
    };
    guard = new SourcePathGuard(mockPort);
  });

  it('allows a path that is the source root itself', async () => {
    await expect(
      guard.assertWithinRegisteredSource('/tmp/demo-docs'),
    ).resolves.toBeUndefined();
  });

  it('allows a path nested within a registered source', async () => {
    await expect(
      guard.assertWithinRegisteredSource('/tmp/demo-docs/guides/file.md'),
    ).resolves.toBeUndefined();
  });

  it('blocks a path traversal attempt escaping the source root', async () => {
    await expect(
      guard.assertWithinRegisteredSource('/tmp/demo-docs/../../etc/passwd'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks a path entirely outside any registered source', async () => {
    await expect(
      guard.assertWithinRegisteredSource('/etc/passwd'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('blocks a sibling directory that merely shares a name prefix', async () => {
    await expect(
      guard.assertWithinRegisteredSource('/tmp/demo-docs-evil/secret.md'),
    ).rejects.toThrow(ForbiddenException);
  });
});
