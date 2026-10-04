import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { NodeFileSystemService } from './node-file-system.service';

describe('NodeFileSystemService', () => {
  let tmpDir: string;
  let fileSystem: NodeFileSystemService;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-service-test-'));
    fileSystem = new NodeFileSystemService();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('distinguishes directories from files and rejects missing paths', async () => {
    const filePath = path.join(tmpDir, 'readme.md');
    await fs.writeFile(filePath, '# Hello');
    await expect(fileSystem.isDirectory(tmpDir)).resolves.toBe(true);
    await expect(fileSystem.isDirectory(filePath)).resolves.toBe(false);
    await expect(
      fileSystem.isDirectory(path.join(tmpDir, 'missing')),
    ).rejects.toThrow();
  });

  it('returns empty array for an empty directory', async () => {
    const result = await fileSystem.scanDirectory(tmpDir);
    expect(result).toEqual([]);
  });

  it('includes .md and .html files but excludes other extensions', async () => {
    await fs.writeFile(path.join(tmpDir, 'readme.md'), '# Hello');
    await fs.writeFile(path.join(tmpDir, 'index.html'), '<h1>Hi</h1>');
    await fs.writeFile(path.join(tmpDir, 'notes.txt'), 'ignore me');
    await fs.writeFile(path.join(tmpDir, 'image.png'), 'binary');

    const result = await fileSystem.scanDirectory(tmpDir);
    const names = result.map((n) => n.name).sort();
    expect(names).toEqual(['index.html', 'readme.md']);
  });

  it('excludes folders that contain no supported files (recursively empty)', async () => {
    await fs.mkdir(path.join(tmpDir, 'empty-folder'));
    await fs.mkdir(path.join(tmpDir, 'empty-folder', 'nested-empty'));
    await fs.writeFile(
      path.join(tmpDir, 'empty-folder', 'nested-empty', 'ignored.txt'),
      'x',
    );

    const result = await fileSystem.scanDirectory(tmpDir);
    expect(result).toEqual([]);
  });

  it('keeps folders that transitively contain supported files, in nested structure', async () => {
    const subDir = path.join(tmpDir, 'docs', 'guides');
    await fs.mkdir(subDir, { recursive: true });
    await fs.writeFile(path.join(subDir, 'guide.md'), '# Guide');

    const result = await fileSystem.scanDirectory(tmpDir);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('folder');
    expect(result[0].name).toBe('docs');

    const guidesFolder = result[0].children?.[0];
    expect(guidesFolder?.name).toBe('guides');
    expect(guidesFolder?.type).toBe('folder');

    const guideFile = guidesFolder?.children?.[0];
    expect(guideFile?.name).toBe('guide.md');
    expect(guideFile?.type).toBe('file');
    expect(guideFile?.extension).toBe('.md');
  });

  it('ignores dotfiles and dot-directories', async () => {
    await fs.writeFile(path.join(tmpDir, '.hidden.md'), 'secret');
    await fs.mkdir(path.join(tmpDir, '.git'));
    await fs.writeFile(path.join(tmpDir, '.git', 'config.md'), 'x');
    await fs.writeFile(path.join(tmpDir, 'visible.md'), 'visible');

    const result = await fileSystem.scanDirectory(tmpDir);
    expect(result.map((n) => n.name)).toEqual(['visible.md']);
  });

  it('sorts folders before files', async () => {
    await fs.writeFile(path.join(tmpDir, 'z-file.md'), 'x');
    await fs.mkdir(path.join(tmpDir, 'a-folder'));
    await fs.writeFile(path.join(tmpDir, 'a-folder', 'inner.md'), 'x');

    const result = await fileSystem.scanDirectory(tmpDir);
    expect(result[0].type).toBe('folder');
    expect(result[1].type).toBe('file');
  });

  it('readFile returns raw file content', async () => {
    const filePath = path.join(tmpDir, 'content.md');
    await fs.writeFile(filePath, '# Title\n\nBody text');

    const content = await fileSystem.readFile(filePath);
    expect(content).toBe('# Title\n\nBody text');
  });

  it('readFileBuffer returns raw binary content', async () => {
    const filePath = path.join(tmpDir, 'image.png');
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    await fs.writeFile(filePath, bytes);

    const buffer = await fileSystem.readFileBuffer(filePath);
    expect(Buffer.compare(buffer, bytes)).toBe(0);
  });

  it('returns empty array when scanning a non-existent directory', async () => {
    const result = await fileSystem.scanDirectory(
      path.join(tmpDir, 'does-not-exist'),
    );
    expect(result).toEqual([]);
  });
});
