import { SourceAccessDeniedError } from '../../domain/errors/file-explorer.errors';
import * as path from 'path';
import { SourceRepository } from '../ports/source.repository';

/**
 * Application service that guards against path traversal by ensuring a given
 * absolute path lies within one of the registered Source root paths.
 */
export class SourcePathGuard {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async assertWithinRegisteredSource(resolvedPath: string): Promise<void> {
    const sources = await this.sourceRepository.listAll();

    const isWithinAnySource = sources.some((source) => {
      const sourceRoot = path.resolve(source.path);
      const relative = path.relative(sourceRoot, resolvedPath);
      return (
        relative === '' ||
        (!relative.startsWith('..') && !path.isAbsolute(relative))
      );
    });

    if (!isWithinAnySource) {
      throw new SourceAccessDeniedError(
        'Requested path is outside all registered sources',
      );
    }
  }
}
