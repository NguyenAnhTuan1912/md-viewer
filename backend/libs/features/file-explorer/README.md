# File explorer feature

Owns registered source folders, supported-file scanning, Markdown/HTML content,
and preview assets. Consumers import the module, tokens, entities, and ports from
`src/index.ts`.

`FileExplorerModule.register({ sourceConfigPath })` binds JSON storage and the
Node filesystem service to `FILE_EXPLORER_TOKENS`. Its factory providers construct
plain application classes. Tests can substitute the exported port tokens with
Nest's `overrideProvider` or instantiate use cases directly with fake ports.

The feature has no database or queue dependency. Its JSON schema is an array of
`{ id, path, name, addedAt }` records. Storage defaults to the backend's existing
`data/sources.config.json` path. It retains the registered-source path checks and
only includes `.md` and `.html` files in directory trees; asset reads support
other extensions for preview resources.

HTTP DTOs and the exception filter belong to presentation. Business errors carry
messages without HTTP status codes. See the backend README for routes and checks.

Persistence implementations live in `infrastructure/repositories/` (for example,
`JsonSourceRepository` implements `SourceRepository`). Technical services live in
`infrastructure/services/` (for example, `NodeFileSystemService`). This matches the
original boilerplate's feature scaffold.
