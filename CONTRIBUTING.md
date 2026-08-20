# Contributing

## Local verification

```bash
cp .env.example .env
pnpm install
pnpm db:up
pnpm verify
```

`pnpm verify` checks formatting, lint rules, TypeScript, module dependencies, unused production code,
unit tests, the production build, OpenAPI drift, migrations, and PostgreSQL-backed e2e tests.

Keep commits focused and include a behavior test for changes to a public module interface.
