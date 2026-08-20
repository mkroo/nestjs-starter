# Repository instructions

- Keep source code, identifiers, commit messages, and documentation in English.
- Use Node.js 24 and the pnpm version pinned in `package.json`.
- Keep feature persistence inside the owning module.
- Import another feature only through `src/modules/<feature>/index.ts` or
  `src/modules/<feature>/composition/index.ts`.
- Export business interfaces from the module root. Export Nest modules only from the composition
  entry point.
- Do not add infrastructure such as authentication, queues, schedulers, or object storage to the
  core starter without an explicit decision.
- Add behavior tests through module interfaces. Add PostgreSQL e2e coverage for persistence and HTTP
  changes.
- Run `pnpm verify` before committing. PostgreSQL must be running and `DATABASE_URL` must be set.
