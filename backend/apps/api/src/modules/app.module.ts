import { DynamicModule, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { FileExplorerModule } from '../../../../libs/features/file-explorer/src';
import { AppConfig, loadAppConfig } from '../../../../libs/platform/config/src';
import { HealthModule } from './health.module';

@Module({})
export class AppModule {
  static register(config: AppConfig = loadAppConfig()): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ServeStaticModule.forRoot({
          rootPath: config.frontendDistPath,
          exclude: ['/health*', '/sources*', '/files*', '/nodes*'],
        }),
        HealthModule,
        FileExplorerModule.register({
          sourceConfigPath: config.sourceConfigPath,
        }),
      ],
    };
  }
}
