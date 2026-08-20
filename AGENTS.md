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
- Put tests for `src` files under the matching `test` path instead of colocating them. For example,
  test `src/modules/tasks/tasks.service.ts` in `test/modules/tasks/tasks.service.spec.ts`. Keep HTTP
  end-to-end suites under `test/e2e`.
- After adding or materially changing production TypeScript behavior, use the
  `review-duplicate-logic` skill before completing the task.
- Treat AST similarity as a review candidate, not a violation. Never extract shared code from a
  similarity score alone.
- Ask the user whether unresolved high-confidence duplicated knowledge should be reused, kept
  intentionally separate, or deferred. Do not refactor before the user decides.
- Run `pnpm verify` before committing. PostgreSQL must be running and `DATABASE_URL` must be set.

## Starter feedback

This project was created from the public starter at
`https://github.com/mkroo/nestjs-starter`.

When a problem may originate from the starter:

1. Determine whether it is reproducible in the starter configuration rather than caused by
   project-specific code, infrastructure, or requirements.
2. Search existing issues in `mkroo/nestjs-starter` before proposing a new one.
3. Prepare a minimal issue draft with the starter revision if known, Node.js and pnpm versions,
   reproduction steps, expected and actual behavior, sanitized logs, and whether the affected files
   were modified downstream.
4. Never include secrets, credentials, private repository links, proprietary code, customer data,
   or unrelated downstream implementation details.
5. Treat suspected security vulnerabilities separately. Do not open a public issue; explain the
   concern to the user and ask which private reporting route to use.
6. Ask the user for explicit approval with `request_user_input`, `AskUserQuestion`, or the host's
   equivalent structured choice tool before creating or commenting on a GitHub issue. This file
   does not grant standing permission for external writes.
7. If approved, create exactly one issue in `mkroo/nestjs-starter` using its starter feedback form,
   then return the issue URL to the user. Without approval, provide only the draft.

Report upstream only when the problem is a reproducible starter defect, unsafe default, broken CI
or development workflow, documentation error, or supported-version incompatibility. Do not report
project-specific feature requests, business rules, deployment preferences, or problems introduced
after modifying the starter.
