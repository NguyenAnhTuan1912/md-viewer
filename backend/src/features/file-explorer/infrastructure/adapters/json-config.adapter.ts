import { Injectable, Optional } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Source, SourceProps } from '../../domain/entities/source.entity';
import { SourceConfigPort } from '../../domain/ports/source-config.port';

const DEFAULT_CONFIG_PATH = path.resolve(
  process.cwd(),
  'data',
  'sources.config.json',
);

@Injectable()
export class JsonConfigAdapter implements SourceConfigPort {
  private readonly configPath: string;

  constructor(@Optional() configPath?: string) {
    this.configPath = configPath ?? DEFAULT_CONFIG_PATH;
  }

  async listAll(): Promise<Source[]> {
    const raw = await this.readRaw();
    return raw.map((props) => new Source(props));
  }

  async findById(id: string): Promise<Source | null> {
    const all = await this.listAll();
    return all.find((source) => source.id === id) ?? null;
  }

  async add(source: Source): Promise<void> {
    const all = await this.readRaw();
    all.push(source.toJSON());
    await this.writeRaw(all);
  }

  private async readRaw(): Promise<SourceProps[]> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  private async writeRaw(sources: SourceProps[]): Promise<void> {
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(
      this.configPath,
      JSON.stringify(sources, null, 2),
      'utf-8',
    );
  }
}
