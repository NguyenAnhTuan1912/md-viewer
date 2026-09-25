import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import * as path from 'path';
import {
  SOURCE_CONFIG_PORT,
  SourceConfigPort,
} from '../ports/source-config.port';

/**
 * Domain service that guards against path traversal by ensuring a given
 * absolute path lies within one of the registered Source root paths.
 */
@Injectable()
export class SourcePathGuard {
  constructor(
    @Inject(SOURCE_CONFIG_PORT)
    private readonly sourceConfigPort: SourceConfigPort,
  ) {}

  async assertWithinRegisteredSource(resolvedPath: string): Promise<void> {
    const sources = await this.sourceConfigPort.listAll();

    const isWithinAnySource = sources.some((source) => {
      const sourceRoot = path.resolve(source.path);
      const relative = path.relative(sourceRoot, resolvedPath);
      return (
        relative === '' ||
        (!relative.startsWith('..') && !path.isAbsolute(relative))
      );
    });

    if (!isWithinAnySource) {
      throw new ForbiddenException(
        'Requested path is outside all registered sources',
      );
    }
  }
}
