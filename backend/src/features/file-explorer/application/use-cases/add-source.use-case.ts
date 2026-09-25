import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Source } from '../../domain/entities/source.entity';
import {
  SOURCE_CONFIG_PORT,
  SourceConfigPort,
} from '../../domain/ports/source-config.port';

export interface AddSourceInput {
  path: string;
  name?: string;
}

@Injectable()
export class AddSourceUseCase {
  constructor(
    @Inject(SOURCE_CONFIG_PORT)
    private readonly sourceConfigPort: SourceConfigPort,
  ) {}

  async execute(input: AddSourceInput): Promise<Source> {
    const resolvedPath = path.resolve(input.path);

    let stat: import('fs').Stats;
    try {
      stat = await fs.stat(resolvedPath);
    } catch {
      throw new BadRequestException(
        `Path does not exist: ${resolvedPath}`,
      );
    }

    if (!stat.isDirectory()) {
      throw new BadRequestException(
        `Path is not a directory: ${resolvedPath}`,
      );
    }

    const existing = await this.sourceConfigPort.listAll();
    const alreadyAdded = existing.some((s) => s.path === resolvedPath);
    if (alreadyAdded) {
      throw new BadRequestException(
        `Folder already added: ${resolvedPath}`,
      );
    }

    const name = input.name?.trim() || path.basename(resolvedPath);
    const source = Source.create(resolvedPath, name);
    await this.sourceConfigPort.add(source);
    return source;
  }
}
