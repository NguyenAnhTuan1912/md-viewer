import { FILE_EXPLORER_TOKENS } from '../tokens/file-explorer.tokens';
import { SourceRepository } from '../application/ports/source.repository';
import { FileSystemPort } from '../application/ports/file-system.port';
import { DynamicModule, Module } from '@nestjs/common';
import { JsonSourceRepository } from '../infrastructure/repositories/json-source.repository';
import { NodeFileSystemService } from '../infrastructure/services/node-file-system.service';
import { SourcePathGuard } from '../application/services/source-path-guard.service';
import { AddSourceUseCase } from '../application/use-cases/add-source.use-case';
import { ListSourcesUseCase } from '../application/use-cases/list-sources.use-case';
import { GetSourceTreeUseCase } from '../application/use-cases/get-source-tree.use-case';
import { GetFileContentUseCase } from '../application/use-cases/get-file-content.use-case';
import { GetFileAssetUseCase } from '../application/use-cases/get-file-asset.use-case';
import { SyncNodeUseCase } from '../application/use-cases/sync-node.use-case';
import { SourcesController } from '../presentation/http/controllers/sources.controller';
import { FilesController } from '../presentation/http/controllers/files.controller';
import { NodesController } from '../presentation/http/controllers/nodes.controller';

export interface FileExplorerModuleOptions {
  sourceConfigPath?: string;
}

@Module({})
export class FileExplorerModule {
  static register(options: FileExplorerModuleOptions = {}): DynamicModule {
    return {
      module: FileExplorerModule,
      controllers: [SourcesController, FilesController, NodesController],
      providers: [
        {
          provide: FILE_EXPLORER_TOKENS.sourceRepository,
          useFactory: () => new JsonSourceRepository(options.sourceConfigPath),
        },
        {
          provide: FILE_EXPLORER_TOKENS.fileSystem,
          useClass: NodeFileSystemService,
        },
        {
          provide: SourcePathGuard,
          useFactory: (sourceRepository: SourceRepository) =>
            new SourcePathGuard(sourceRepository),
          inject: [FILE_EXPLORER_TOKENS.sourceRepository],
        },
        //
        // TODO: Import use cases
        //
        {
          provide: AddSourceUseCase,
          useFactory: (
            sourceRepository: SourceRepository,
            fileSystem: FileSystemPort,
          ) => new AddSourceUseCase(sourceRepository, fileSystem),
          inject: [
            FILE_EXPLORER_TOKENS.sourceRepository,
            FILE_EXPLORER_TOKENS.fileSystem,
          ],
        },
        {
          provide: ListSourcesUseCase,
          useFactory: (sourceRepository: SourceRepository) =>
            new ListSourcesUseCase(sourceRepository),
          inject: [FILE_EXPLORER_TOKENS.sourceRepository],
        },
        {
          provide: GetSourceTreeUseCase,
          useFactory: (
            sourceRepository: SourceRepository,
            fileSystem: FileSystemPort,
          ) => new GetSourceTreeUseCase(sourceRepository, fileSystem),
          inject: [
            FILE_EXPLORER_TOKENS.sourceRepository,
            FILE_EXPLORER_TOKENS.fileSystem,
          ],
        },
        {
          provide: GetFileContentUseCase,
          useFactory: (fileSystem: FileSystemPort, guard: SourcePathGuard) =>
            new GetFileContentUseCase(fileSystem, guard),
          inject: [FILE_EXPLORER_TOKENS.fileSystem, SourcePathGuard],
        },
        {
          provide: GetFileAssetUseCase,
          useFactory: (fileSystem: FileSystemPort, guard: SourcePathGuard) =>
            new GetFileAssetUseCase(fileSystem, guard),
          inject: [FILE_EXPLORER_TOKENS.fileSystem, SourcePathGuard],
        },
        {
          provide: SyncNodeUseCase,
          useFactory: (fileSystem: FileSystemPort, guard: SourcePathGuard) =>
            new SyncNodeUseCase(fileSystem, guard),
          inject: [FILE_EXPLORER_TOKENS.fileSystem, SourcePathGuard],
        },
      ],
      exports: [ListSourcesUseCase, FILE_EXPLORER_TOKENS.sourceRepository],
    };
  }
}
