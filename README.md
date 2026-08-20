# NestJS Starter

[English](README.md) | [한국어](README.ko.md)

An opinionated, production-minded NestJS starter for API-first side projects.

> This is the `example` branch. It extends the minimal
> [`main`](https://github.com/mkroo/nestjs-starter/tree/main) template with a complete
> PostgreSQL-backed Tasks vertical slice.

It favors a small modular monolith, explicit module interfaces, PostgreSQL, and transparent SQL over
premature distributed architecture or generic repository abstractions.

## Built-in capabilities

Versions are defined in [`package.json`](package.json). This table describes why each dependency is
included and what the starter configures for it.

| Concern                    | Libraries                                                                                                                                                      | What the starter provides                                                            |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Runtime                    | [Node.js](https://github.com/nodejs/node), [TypeScript](https://github.com/microsoft/TypeScript), [pnpm](https://github.com/pnpm/pnpm)                         | Node.js 24, TypeScript 6, native ESM, and a pinned package-manager version           |
| Application framework      | [NestJS](https://github.com/nestjs/nest)                                                                                                                       | A single API composition root organized as a modular monolith                        |
| Configuration              | [NestJS Config](https://github.com/nestjs/config), [Zod](https://github.com/colinhacks/zod)                                                                    | Fail-fast environment parsing with typed configuration                               |
| HTTP validation            | [class-validator](https://github.com/typestack/class-validator), [class-transformer](https://github.com/typestack/class-transformer)                           | A global `ValidationPipe` that rejects unknown fields and transforms request DTOs    |
| Database access            | [PostgreSQL](https://github.com/postgres/postgres), [node-postgres](https://github.com/brianc/node-postgres)                                                   | PostgreSQL 18 with pooled connections and lifecycle management                       |
| SQL and migrations         | [Drizzle ORM and Drizzle Kit](https://github.com/drizzle-team/drizzle-orm)                                                                                     | Typed SQL, module-owned schemas, and committed migrations                            |
| Structured logging         | [Pino](https://github.com/pinojs/pino), [pino-http](https://github.com/pinojs/pino-http), [nestjs-pino](https://github.com/iamolegga/nestjs-pino)              | JSON request logging in production and readable local development output             |
| Distributed tracing        | [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js), [OpenTelemetry JS Contrib](https://github.com/open-telemetry/opentelemetry-js-contrib) | HTTP, NestJS, PostgreSQL, and Pino trace correlation with vendor-neutral OTLP export |
| API documentation          | [NestJS Swagger](https://github.com/nestjs/swagger)                                                                                                            | Swagger UI and a committed OpenAPI document with drift detection                     |
| Unit and integration tests | [Vitest](https://github.com/vitest-dev/vitest)                                                                                                                 | Unit tests, configuration tests, and Nest dependency-injection smoke tests           |
| HTTP end-to-end tests      | [Supertest](https://github.com/ladjs/supertest)                                                                                                                | PostgreSQL-backed tests against the real NestJS HTTP application                     |
| Static analysis            | [ESLint](https://github.com/eslint/eslint), [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)                                        | Type-aware linting with zero warnings allowed                                        |
| Formatting                 | [Prettier](https://github.com/prettier/prettier)                                                                                                               | Deterministic formatting checked in CI                                               |
| Architecture checks        | [dependency-cruiser](https://github.com/sverweij/dependency-cruiser)                                                                                           | Circular dependency, deep import, and module-boundary enforcement                    |
| Dead-code checks           | [Knip](https://github.com/webpro-nl/knip)                                                                                                                      | Detection of unused production files, exports, and dependencies                      |
| Duplicate logic review     | [TypeScript Compiler API](https://github.com/microsoft/TypeScript), [Codex skills](https://learn.chatgpt.com/docs/build-skills)                                | Advisory AST comparison with an explicit reuse-or-separate decision                  |

Production packaging uses [Docker](https://github.com/docker), and repository verification runs
through [GitHub Actions](https://github.com/features/actions).

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
.agents/skills/         # repository-local agent workflows
src/
├── composition/          # application composition root
├── config/               # fail-fast environment parsing
├── modules/
│   ├── health/
│   └── tasks/            # sample vertical slice
└── platform/
    ├── database/         # pg pool and Drizzle lifecycle
    ├── logging/          # Pino structured logging
    └── telemetry/        # OpenTelemetry tracing and OTLP export
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

| Command                   | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| `pnpm dev`                | Run the API in watch mode                     |
| `pnpm build`              | Build production JavaScript                   |
| `pnpm db:generate`        | Generate SQL migrations from feature schemas  |
| `pnpm db:migrate`         | Apply committed migrations                    |
| `pnpm db:studio`          | Open Drizzle Studio                           |
| `pnpm test`               | Run unit and DI smoke tests                   |
| `pnpm test:e2e`           | Run PostgreSQL-backed HTTP tests              |
| `pnpm analyze:duplicates` | Find structurally duplicated production logic |
| `pnpm architecture`       | Check module interfaces and cycles            |
| `pnpm deadcode`           | Check unused production code and dependencies |
| `pnpm openapi:generate`   | Regenerate `openapi/openapi.json`             |
| `pnpm verify`             | Run the complete local CI pipeline            |

`pnpm verify` expects PostgreSQL to be running and `DATABASE_URL` to be configured. The quickest
setup is `cp .env.example .env && pnpm db:up`.

## Duplicate logic review

Architecture, framework conventions, and clean-code practices ultimately seek high cohesion and
low coupling so that software can express more behavior with less accidental complexity. The
useful unit to minimize is not lines of code but duplicated knowledge and independent change
points. Two explicit implementations are preferable to one misleading abstraction when similar
code represents different domain rules, owners, or reasons to change.

The repository turns this principle into an explicit review workflow:

- [`AGENTS.md`](AGENTS.md) requires duplicate-logic review after production TypeScript behavior
  changes and prevents similarity scores from triggering automatic refactoring.
- [`review-duplicate-logic`](.agents/skills/review-duplicate-logic/SKILL.md) defines the agent
  workflow: inspect candidates in context, present evidence, and ask the user to reuse, intentionally
  separate, or defer the duplicated knowledge.
- [`decision-rubric.md`](.agents/skills/review-duplicate-logic/references/decision-rubric.md)
  distinguishes repeated knowledge from coincidental structural similarity using domain ownership,
  invariants, transaction boundaries, dependencies, and change cadence.
- [`duplicate-analyzer.ts`](.agents/skills/review-duplicate-logic/scripts/duplicate-analyzer.ts)
  performs deterministic TypeScript AST normalization and structural comparison. It produces
  review candidates, not architectural verdicts.
- [`.duplicate-logic-decisions.json`](.duplicate-logic-decisions.json) records intentional
  separation and deferred decisions. A decision remains valid only while its candidate fingerprint
  is unchanged.

Run the analyzer without an agent when needed:

```bash
pnpm analyze:duplicates -- --changed
```

The analyzer never refactors code or fails because candidates exist. CI can execute it as a
deterministic report, while the interactive decision remains with the user.

## Observability

OpenTelemetry tracing is always active so Pino request logs include `trace_id` and `span_id` and
W3C trace context propagates across supported calls. Traces stay inside the process by default:

```env
OTEL_SERVICE_NAME=nestjs-starter
OTEL_TRACES_EXPORTER=none
```

To send traces to any OTLP/HTTP-compatible backend, enable the standard exporter and configure its
endpoint. Authentication headers and sampling use standard OpenTelemetry environment variables:

```env
OTEL_TRACES_EXPORTER=otlp
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-endpoint.example.com
OTEL_EXPORTER_OTLP_HEADERS=authorization=your-token
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

No observability vendor SDK is included. Grafana, Datadog, Sentry, New Relic, a self-hosted SigNoz
instance, or an OpenTelemetry Collector can be selected without changing application tracing code.
The application does not create or return an `x-request-id`; `trace_id` is the canonical correlation
identifier.

## What is intentionally not included

Authentication, queues, schedulers, object storage, caching, and multiple application entry points
are deliberately outside the core starter. Add them when a real project needs them instead of
paying their complexity cost in every project.

## License

[MIT](LICENSE)
