import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { HealthModule } from './health/health.module';
import { FileExplorerModule } from './features/file-explorer/file-explorer.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), '..', 'frontend', 'dist'),
      exclude: ['/health*', '/sources*', '/files*', '/nodes*'],
    }),
    HealthModule,
    FileExplorerModule,
  ],
})
export class AppModule {}
