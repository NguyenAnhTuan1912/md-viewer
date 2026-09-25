import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { JsonConfigAdapter } from './json-config.adapter';
import { Source } from '../../domain/entities/source.entity';

describe('JsonConfigAdapter', () => {
  let tmpDir: string;
  let configPath: string;
  let adapter: JsonConfigAdapter;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'json-config-test-'));
    configPath = path.join(tmpDir, 'sources.config.json');
    adapter = new JsonConfigAdapter(configPath);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('returns empty array when config file does not exist yet', async () => {
    const result = await adapter.listAll();
    expect(result).toEqual([]);
  });

  it('persists an added source and lists it back', async () => {
    const source = Source.create('/tmp/some-folder', 'some-folder');
    await adapter.add(source);

    const all = await adapter.listAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(source.id);
    expect(all[0].path).toBe('/tmp/some-folder');
    expect(all[0].name).toBe('some-folder');
  });

  it('writes valid JSON to disk', async () => {
    const source = Source.create('/tmp/another-folder', 'another-folder');
    await adapter.add(source);

    const raw = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].path).toBe('/tmp/another-folder');
  });

  it('findById returns the matching source or null', async () => {
    const source = Source.create('/tmp/find-me', 'find-me');
    await adapter.add(source);

    const found = await adapter.findById(source.id);
    expect(found?.id).toBe(source.id);

    const notFound = await adapter.findById('non-existent-id');
    expect(notFound).toBeNull();
  });

  it('accumulates multiple sources across add calls', async () => {
    await adapter.add(Source.create('/tmp/a', 'a'));
    await adapter.add(Source.create('/tmp/b', 'b'));

    const all = await adapter.listAll();
    expect(all).toHaveLength(2);
    expect(all.map((s) => s.name).sort()).toEqual(['a', 'b']);
  });
});
