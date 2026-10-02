# Markdown/HTML Viewer frontend

React 19, TypeScript, Vite, Tailwind CSS, AlignUI, TanStack Query, and Zustand.

## Development

From this directory:

```bash
npm ci
npm run dev         # http://localhost:19120
npm test            # Run Vitest and React Testing Library tests
npm run test:watch  # Watch tests
npm run lint        # Run Oxlint
npm run build       # Type-check and build for production
npm run check       # Lint, tests, and production build
```

Start the backend separately as described in the repository README. The shared
API client uses `http://localhost:19121` for requests and preview assets.

## Structure

This follows the feature-oriented structure of `react-boilerplate`:

```text
src/
├── app/
│   ├── app.tsx          # Application composition
│   ├── layouts/        # Viewer shell, header, and sidebar
│   └── providers/      # Query client, theme synchronization, and notifications
├── components/ui/      # Shared AlignUI primitives
├── features/
│   ├── sidebar-tree/   # Tree queries, sync API, components, and persisted state
│   ├── sources/        # Source APIs, query/mutation hooks, and add-folder dialog
│   ├── theme/store/    # Persisted theme preference and actions
│   └── viewer/         # File API, tabs, renderers, asset helpers, and state
├── lib/                # Shared UI helpers and API transport/contracts
├── pages/              # Viewer page and its data orchestration
└── test/               # Shared test setup
```

Keep code and tests next to the feature that owns them. Feature `api/` modules
own HTTP calls and mutation input contracts. `queries/` hooks own TanStack Query
keys, caching, invalidation, and mutation notifications. Components consume
those hooks rather than calling the shared transport directly.

Zustand hooks contain state only. Exported `*StoreActions` objects perform
mutations through the hook's static `setState` API. Components select state with
hooks and call actions directly. Existing `md-viewer-*` storage keys and state
shapes are preserved so saved tabs, expansion, sidebar width, and theme survive
the refactor.

Local type aliases use `T` prefixes and interfaces use `I` prefixes; imported
library types keep their original names. Imports use the `@/` source alias.

The project retains npm, Oxlint, the fetch-based transport, and AlignUI. The
single-screen application composes `ViewerPage` directly; add a router when
additional URL-based pages are needed. Boilerplate demo features and unused
integrations are not included.
