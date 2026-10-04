import * as path from 'node:path';
import type { AppConfig } from '../types/app-config';

export function loadAppConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): AppConfig {
  const port = Number(env.PORT ?? 19121);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return {
    port,
    sourceConfigPath: path.resolve(
      cwd,
      env.SOURCE_CONFIG_PATH || 'data/sources.config.json',
    ),
    frontendDistPath: path.resolve(
      cwd,
      env.FRONTEND_DIST_PATH || '../frontend/dist',
    ),
  };
}
