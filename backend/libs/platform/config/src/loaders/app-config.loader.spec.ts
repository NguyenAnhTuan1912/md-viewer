import * as path from 'node:path';
import { loadAppConfig } from './app-config.loader';

describe('loadAppConfig', () => {
  it('preserves the backend port and existing storage/static paths', () => {
    expect(loadAppConfig({}, '/workspace/backend')).toEqual({
      port: 19121,
      sourceConfigPath: '/workspace/backend/data/sources.config.json',
      frontendDistPath: '/workspace/frontend/dist',
    });
  });

  it('resolves configured paths relative to the backend working directory', () => {
    expect(
      loadAppConfig(
        {
          PORT: '3000',
          SOURCE_CONFIG_PATH: 'storage/sources.json',
          FRONTEND_DIST_PATH: '/srv/viewer',
        },
        '/workspace/backend',
      ),
    ).toEqual({
      port: 3000,
      sourceConfigPath: path.resolve('/workspace/backend/storage/sources.json'),
      frontendDistPath: '/srv/viewer',
    });
  });

  it.each(['', 'abc', '0', '-1', '65536', '3000.5'])(
    'rejects invalid port %j before starting the server',
    (PORT) => {
      expect(() => loadAppConfig({ PORT })).toThrow('PORT must be an integer');
    },
  );
});
