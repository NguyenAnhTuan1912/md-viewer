import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { loadAppConfig } from '../../../libs/platform/config/src';
import { createApplication } from './bootstrap';

async function bootstrap(): Promise<void> {
  const config = loadAppConfig();
  const app = await createApplication(config);
  await app.listen(config.port);
  Logger.log(
    `Backend listening on http://localhost:${config.port}`,
    'Bootstrap',
  );
}

void bootstrap().catch((error: unknown) => {
  Logger.error(error, undefined, 'Bootstrap');
  process.exitCode = 1;
});
