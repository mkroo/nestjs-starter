# NestJS Starter

An opinionated, production-minded NestJS starter for API-first side projects.

It favors a small modular monolith, explicit module interfaces, PostgreSQL, and transparent SQL over
premature distributed architecture or generic repository abstractions.

## Stack

- Node.js 24 and TypeScript 6
- NestJS 11 with native ESM
- PostgreSQL 18 and Drizzle ORM
- Zod environment validation
- Pino structured logging and request IDs
- Swagger and a committed OpenAPI document
- Vitest and Supertest
- ESLint, Prettier, dependency-cruiser, and Knip
- Docker Compose and GitHub Actions

Provider-specific PostgreSQL SDKs are intentionally excluded. Configure any compatible PostgreSQL
database with `DATABASE_URL`.

## Quick start

Requirements: Node.js 24, Docker, and Corepack.

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:up
pnpm db:migrate
pnpm dev
```

The API starts at `http://localhost:3000/api`. Swagger UI is available at
`http://localhost:3000/docs`.

```bash
curl http://localhost:3000/api/health/live

curl -X POST http://localhost:3000/api/tasks \
  -H 'content-type: application/json' \
  -d '{"title":"Ship the starter"}'

curl http://localhost:3000/api/tasks
```

## Project structure

```text
src/
├── composition/          # application composition root
├── config/               # fail-fast environment parsing
├── modules/
│   ├── health/
│   └── tasks/            # sample vertical slice
└── platform/
    ├── database/         # pg pool and Drizzle lifecycle
    └── logging/          # Pino and request IDs
drizzle/                  # generated SQL migrations
openapi/                  # generated OpenAPI document
test/e2e/                 # PostgreSQL-backed HTTP tests
```

Read [docs/architecture.md](docs/architecture.md) before adding a feature.

## Module rules

- A feature exposes its business interface through `src/modules/<feature>/index.ts`.
- The application composition root imports its Nest module through
  `src/modules/<feature>/composition/index.ts`.
- Cross-module deep imports and circular dependencies fail `pnpm architecture`.
- Every table schema and query adapter stays in the feature that owns the data.
- Drizzle types do not appear in a feature's public interface.
- A repository interface is added only when it represents a real testing or implementation seam.

## Commands

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `pnpm dev`              | Run the API in watch mode                     |
| `pnpm build`            | Build production JavaScript                   |
| `pnpm db:generate`      | Generate SQL migrations from feature schemas  |
| `pnpm db:migrate`       | Apply committed migrations                    |
| `pnpm db:studio`        | Open Drizzle Studio                           |
| `pnpm test`             | Run unit and DI smoke tests                   |
| `pnpm test:e2e`         | Run PostgreSQL-backed HTTP tests              |
| `pnpm architecture`     | Check module interfaces and cycles            |
| `pnpm deadcode`         | Check unused production code and dependencies |
| `pnpm openapi:generate` | Regenerate `openapi/openapi.json`             |
| `pnpm verify`           | Run the complete local CI pipeline            |

`pnpm verify` expects PostgreSQL to be running and `DATABASE_URL` to be configured. The quickest
setup is `cp .env.example .env && pnpm db:up`.

## What is intentionally not included

Authentication, queues, schedulers, object storage, caching, and multiple application entry points
are deliberately outside the core starter. Add them when a real project needs them instead of
paying their complexity cost in every project.

## License

[MIT](LICENSE)
