# Contributing

## Local verification

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm analyze:duplicates -- --changed
pnpm verify
```

`pnpm verify` checks formatting, lint rules, TypeScript, module dependencies, unused production code,
unit tests, the production build, OpenAPI drift, and PostgreSQL-backed e2e tests.

The duplicate analyzer is advisory. Review unresolved candidates with the
`review-duplicate-logic` skill before consolidating or intentionally separating the implementations.

Keep commits focused and include a behavior test for changes to a public module interface.
