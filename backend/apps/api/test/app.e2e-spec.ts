import { loadAppConfig } from '../../../libs/platform/config/src';
import { configureApplication, createApplication } from '../src/bootstrap';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { AppModule } from '../src/modules/app.module';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.register()],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});

describe('File explorer HTTP contract (e2e)', () => {
  let app: INestApplication;
  let tmpDir: string;
  let sourceId: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'asset-e2e-'));
    await fs.mkdir(path.join(tmpDir, 'images'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, 'images', 'logo.png'),
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    );
    await fs.writeFile(path.join(tmpDir, 'readme.md'), '# Hello');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule.register({
          ...loadAppConfig(),
          sourceConfigPath: path.join(tmpDir, 'sources.config.json'),
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/sources')
      .send({ path: tmpDir })
      .expect(201);
    sourceId = response.body.id;
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('lists registered sources with the existing response shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/sources')
      .expect(200);
    expect(response.body).toEqual([
      {
        id: sourceId,
        path: tmpDir,
        name: path.basename(tmpDir),
        addedAt: expect.any(String),
      },
    ]);
  });

  it('returns the source tree and rescans newly added files', async () => {
    const response = await request(app.getHttpServer())
      .get(`/sources/${sourceId}/tree`)
      .expect(200);
    expect(response.body).toEqual({
      sourceId,
      sourceName: path.basename(tmpDir),
      tree: [
        {
          name: 'readme.md',
          path: path.join(tmpDir, 'readme.md'),
          type: 'file',
          extension: '.md',
        },
      ],
    });
    await fs.writeFile(path.join(tmpDir, 'new.html'), '<h1>New</h1>');
    const synced = await request(app.getHttpServer())
      .post('/nodes/sync')
      .send({ path: tmpDir })
      .expect(201);
    expect(synced.body.map((node: { name: string }) => node.name)).toEqual([
      'new.html',
      'readme.md',
    ]);
  });

  it('returns Markdown and HTML content with their existing type tags', async () => {
    await request(app.getHttpServer())
      .get('/files/content')
      .query({ path: path.join(tmpDir, 'readme.md') })
      .expect(200)
      .expect({ content: '# Hello', type: 'markdown' });
    await fs.writeFile(path.join(tmpDir, 'index.html'), '<h1>Hello</h1>');
    await request(app.getHttpServer())
      .get('/files/content')
      .query({ path: path.join(tmpDir, 'index.html') })
      .expect(200)
      .expect({ content: '<h1>Hello</h1>', type: 'html' });
  });

  it('preserves error status, message, and error label for business failures', async () => {
    await request(app.getHttpServer())
      .post('/sources')
      .send({ path: tmpDir })
      .expect(400)
      .expect({
        statusCode: 400,
        error: 'Bad Request',
        message: `Folder already added: ${tmpDir}`,
      });
    await request(app.getHttpServer())
      .get('/sources/missing/tree')
      .expect(404)
      .expect({
        statusCode: 404,
        error: 'Not Found',
        message: 'Source not found: missing',
      });
    await request(app.getHttpServer())
      .get('/files/content')
      .query({ path: '/outside-source/readme.md' })
      .expect(403)
      .expect({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Requested path is outside all registered sources',
      });
  });

  it('validates requests through the production bootstrap configuration', async () => {
    await request(app.getHttpServer())
      .post('/sources')
      .send({ path: 42 })
      .expect(400);
    await request(app.getHttpServer()).get('/files/content').expect(400);
    await request(app.getHttpServer()).post('/nodes/sync').send({}).expect(400);
  });

  it('allows the existing frontend development origin', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'http://localhost:19120')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'http://localhost:19120')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('serves a valid asset with the correct content type', async () => {
    const response = await request(app.getHttpServer())
      .get('/files/asset')
      .query({ path: path.join(tmpDir, 'images', 'logo.png') })
      .expect(200);

    expect(response.headers['content-type']).toBe('image/png');
    expect(
      Buffer.compare(response.body, Buffer.from([0x89, 0x50, 0x4e, 0x47])),
    ).toBe(0);
  });

  it('blocks path traversal outside registered sources', async () => {
    await request(app.getHttpServer())
      .get('/files/asset')
      .query({ path: '/etc/passwd' })
      .expect(403);
  });

  it('returns 404 for a missing asset within a registered source', async () => {
    await request(app.getHttpServer())
      .get('/files/asset')
      .query({ path: path.join(tmpDir, 'images', 'missing.png') })
      .expect(404);
  });
});

describe('Application configuration and static hosting (e2e)', () => {
  let app: INestApplication;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'static-e2e-'));
    const frontendDistPath = path.join(tmpDir, 'site');
    await fs.mkdir(frontendDistPath);
    await fs.writeFile(
      path.join(frontendDistPath, 'index.html'),
      '<h1>Viewer shell</h1>',
    );
    // Use the real bootstrap: ServeStaticModule selects its HTTP loader during
    // provider construction, before TestingModule.createNestApplication runs.
    app = await createApplication({
      port: 19121,
      frontendDistPath,
      sourceConfigPath: path.join(tmpDir, 'data', 'sources.json'),
    });
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('serves the configured frontend and keeps API routes separate', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('<h1>Viewer shell</h1>');
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
    await request(app.getHttpServer()).get('/sources').expect(200).expect([]);
    await request(app.getHttpServer()).get('/sources/missing/tree').expect(404);
  });

  it('writes registered sources to the configured JSON path', async () => {
    const response = await request(app.getHttpServer())
      .post('/sources')
      .send({ path: tmpDir, name: 'Test source', ignored: 'not a DTO field' })
      .expect(201);
    const saved = JSON.parse(
      await fs.readFile(path.join(tmpDir, 'data', 'sources.json'), 'utf8'),
    );
    expect(saved).toEqual([response.body]);
    expect(response.body.name).toBe('Test source');
    expect(response.body).not.toHaveProperty('ignored');
  });
});
