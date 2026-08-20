# Architecture

This starter is a single NestJS application organized as a modular monolith. Each feature owns its
business behavior, transport adapters, and persistence.

## Module interfaces

Every feature has two allowed entry points:

- `index.ts` is the business interface used by other feature modules.
- `composition/index.ts` exports the Nest module used by the application composition root.

Everything else is implementation. `dependency-cruiser` creates a rule for every directory under
`src/modules` and rejects imports that bypass these entry points.

```text
src/modules/tasks/
├── index.ts                    # business interface
├── composition/index.ts        # Nest composition interface
├── application/                # use cases and internal seams
├── domain/                     # domain types and rules
├── persistence/                # Drizzle schema and PostgreSQL adapter
└── transport/http/             # controllers and transport DTOs
```

## Dependency direction

```text
composition -> module composition interface
transport   -> application interface
application -> domain + internal persistence seam
persistence -> domain + PostgreSQL/Drizzle platform
```

The Drizzle schema belongs to the feature that owns the table. The database platform manages only
the connection pool and Drizzle client lifecycle; it does not collect feature schemas or provide a
generic repository.

## Duplication and abstraction

The goal is to minimize duplicated knowledge and independent change points, not lines of code.
Extract behavior when occurrences express the same domain rule and should change together. Keep
similar implementations separate when they have different owners, invariants, transaction
boundaries, or reasons to change.

The repository-local `review-duplicate-logic` skill uses AST similarity to find evidence for this
decision. Similarity is advisory: the user decides whether to reuse the knowledge, preserve an
intentional separation, or defer until the domain is clearer.

## Adding a feature

1. Create `src/modules/<feature>` with a root `index.ts` and `composition/index.ts`.
2. Start with one behavior test against the root business interface under
   `test/modules/<feature>/`, mirroring its `src/modules/<feature>/` path.
3. Add an internal persistence seam only when the behavior needs persistence.
4. Keep the Drizzle schema and adapter under that feature.
5. Import the Nest module from `src/composition/app.module.ts` through its composition entry point.
6. Run `pnpm analyze:duplicates -- --changed` and review unresolved candidates.
7. Run `pnpm architecture` and `pnpm verify`.
