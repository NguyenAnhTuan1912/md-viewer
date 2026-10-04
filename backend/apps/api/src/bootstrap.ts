import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppConfig, loadAppConfig } from '../../../libs/platform/config/src';
import { AppModule } from './modules/app.module';

/** Shared by production startup and HTTP tests. */
export function configureApplication(app: INestApplication): void {
  app.enableCors({
    origin: [
      'http://localhost:19120',
      'http://localhost:19121',
      /^http:\/\/localhost:\d+$/,
    ],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}

export async function createApplication(
  config: AppConfig = loadAppConfig(),
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule.register(config));

  configureApplication(app);
  app.enableShutdownHooks();

  await app.init();

  return app;
}
