import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { AppModule } from './../src/app.module';
import { SOURCE_CONFIG_PORT } from '../src/features/file-explorer/domain/ports/source-config.port';
import { JsonConfigAdapter } from '../src/features/file-explorer/infrastructure/adapters/json-config.adapter';

describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

describe('Files asset endpoint (e2e)', () => {
  let app: INestApplication;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'asset-e2e-'));
    await fs.mkdir(path.join(tmpDir, 'images'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, 'images', 'logo.png'),
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    );
    await fs.writeFile(path.join(tmpDir, 'readme.md'), '# Hello');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SOURCE_CONFIG_PORT)
      .useValue(
        new JsonConfigAdapter(path.join(tmpDir, 'sources.config.json')),
      )
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    await request(app.getHttpServer())
      .post('/sources')
      .send({ path: tmpDir })
      .expect(201);
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('serves a valid asset with the correct content type', async () => {
    const response = await request(app.getHttpServer())
      .get('/files/asset')
      .query({ path: path.join(tmpDir, 'images', 'logo.png') })
      .expect(200);

    expect(response.headers['content-type']).toBe('image/png');
    expect(Buffer.compare(response.body, Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(0);
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
