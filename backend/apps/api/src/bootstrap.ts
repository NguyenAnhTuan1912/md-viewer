import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppConfig, loadAppConfig } from '../../../libs/platform/config/src';
import { AppModule } from './modules/app.module';

function configureSwagger(app: INestApplication, config: AppConfig): void {
  const options = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription('Feature-first reference API')
    .setVersion('1.0')
    .addServer(config.publicUrl, 'Configured API server')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: {
      persistAuthorization: config.environment === 'development',
    },
  });
}

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

  if (config.environment === 'development') configureSwagger(app, config);

  await app.init();

  return app;
}
