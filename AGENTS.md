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
- After adding or materially changing production TypeScript behavior, use the
  `review-duplicate-logic` skill before completing the task.
- Treat AST similarity as a review candidate, not a violation. Never extract shared code from a
  similarity score alone.
- Ask the user whether unresolved high-confidence duplicated knowledge should be reused, kept
  intentionally separate, or deferred. Do not refactor before the user decides.
- Run `pnpm verify` before committing. PostgreSQL must be running and `DATABASE_URL` must be set.
