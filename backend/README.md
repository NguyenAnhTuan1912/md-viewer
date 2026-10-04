# Markdown/HTML Viewer backend

NestJS API and static frontend host, structured after `mono-nestjs-boilerplate`.
Run commands from `backend/` so the default data and frontend paths resolve as expected.

```bash
npm ci
npm run start:dev     # Watch mode, http://localhost:19121
npm test -- --runInBand
npm run test:e2e      # HTTP integration tests with temporary storage
npm run build
npm run start:prod    # node dist/apps/api/src/main.js
npm run check        # Formatting, lint, unit tests, HTTP tests, build
```

`npm run lint` checks without changing files; `lint:fix` applies fixes.
`npm run format` formats application/library TypeScript sources.

## Structure

```text
apps/api/
  src/
    main.ts              # Process entry point
    bootstrap.ts         # Application creation, validation, CORS, lifecycle
    modules/             # API composition and health module
    controllers/         # Health endpoint
  test/                  # HTTP contract and static-hosting tests
libs/
  features/file-explorer/
    src/
      domain/            # Entities and framework-independent errors
      application/       # Ports, use cases, registered-source path guard
      infrastructure/
        repositories/    # JSON source repository
        services/        # Node filesystem service
      presentation/http/ # Controllers, DTOs, error-to-HTTP translation
      modules/           # Nest provider factories and bindings
      tokens/            # Explicit dependency injection symbols
      index.ts           # Public feature contract
  platform/config/
    src/                 # Typed configuration and environment loader
```

The API app composes features through their public entry points. Inside each
library, relative imports preserve runtime compatibility with the existing
CommonJS/Nest build. Domain and application code do not import NestJS or concrete
infrastructure implementations; ESLint enforces these boundaries. Use cases receive ports through plain
constructors, and the feature module binds implementations with factory providers.

The source path guard lives in the application layer because it consults the
source repository. Directory validation uses the filesystem port. Business errors
become the existing Nest-style `{ message, error, statusCode }` response in the
feature's HTTP exception filter. Validation errors continue to use Nest's default
validation response.

This application has one business feature. It retains Express, Jest, npm, and JSON
storage. The reference boilerplate's workers, authentication, queues, databases,
and feature-flag machinery are not required for the viewer.

## Configuration and existing data

Set variables in the process environment or PM2 configuration; `.env.example`
documents the options but `.env` files are not automatically loaded.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `19121` | Integer TCP port from 1 to 65535 |
| `SOURCE_CONFIG_PATH` | `data/sources.config.json` | Existing source registry |
| `FRONTEND_DIST_PATH` | `../frontend/dist` | Built frontend directory |

Relative paths resolve from the backend working directory. Existing source JSON
and UUIDs need no migration. Tests use temporary storage and do not modify the
personal registry. Build the frontend with `npm run build --prefix ../frontend`
before serving the complete application.

The root PM2 configuration runs `dist/apps/api/src/main.js` with `backend/` as its
working directory. Root build/install commands remain the same.

## HTTP contract

- `GET /health`: `{ status: "ok" }`
- `GET /sources`: registered sources
- `POST /sources`: register `{ path, name? }` (201)
- `GET /sources/:id/tree`: supported files and folders for a source
- `GET /files/content?path=...`: `{ content, type: "markdown" | "html" }`
- `GET /files/asset?path=...`: binary assets with content type and `no-cache`
- `POST /nodes/sync`: rescan `{ path }` (201)

Routes, response shapes, source persistence, preview MIME types, development CORS,
and registered-source path checks retain their previous behavior.
