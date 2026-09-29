import { Module } from '@nestjs/common';
import { SOURCE_CONFIG_PORT } from './domain/ports/source-config.port';
import { FILE_SYSTEM_PORT } from './domain/ports/file-system.port';
import { JsonConfigAdapter } from './infrastructure/adapters/json-config.adapter';
import { NodeFileSystemAdapter } from './infrastructure/adapters/node-file-system.adapter';
import { SourcePathGuard } from './domain/services/source-path-guard.service';
import { AddSourceUseCase } from './application/use-cases/add-source.use-case';
import { ListSourcesUseCase } from './application/use-cases/list-sources.use-case';
import { GetSourceTreeUseCase } from './application/use-cases/get-source-tree.use-case';
import { GetFileContentUseCase } from './application/use-cases/get-file-content.use-case';
import { GetFileAssetUseCase } from './application/use-cases/get-file-asset.use-case';
import { SyncNodeUseCase } from './application/use-cases/sync-node.use-case';
import { SourcesController } from './presentation/http/sources.controller';
import { FilesController } from './presentation/http/files.controller';
import { NodesController } from './presentation/http/nodes.controller';

@Module({
  controllers: [SourcesController, FilesController, NodesController],
  providers: [
    {
      provide: SOURCE_CONFIG_PORT,
      useClass: JsonConfigAdapter,
    },
    {
      provide: FILE_SYSTEM_PORT,
      useClass: NodeFileSystemAdapter,
    },
    SourcePathGuard,
    AddSourceUseCase,
    ListSourcesUseCase,
    GetSourceTreeUseCase,
    GetFileContentUseCase,
    GetFileAssetUseCase,
    SyncNodeUseCase,
  ],
})
export class FileExplorerModule {}
