---
name: review-duplicate-logic
description: Review changed production TypeScript for structurally duplicated business logic before completing an implementation or code review. Use when changes may repeat validation, control flow, transformations, persistence calls, or error handling across functions or modules. Do not use for generated code, migrations, tests, DTO declarations, or formatting-only changes.
---

# Review Duplicate Logic

Treat duplication as evidence about repeated knowledge, not as an automatic refactoring order.

## Workflow

1. Run `pnpm analyze:duplicates -- --changed --json`. If Git history is unavailable, the analyzer
   scans all eligible production functions. Continue only after the command returns valid JSON.
2. Remove candidates whose `review.status` is `resolved`. Read
   [the decision rubric](references/decision-rubric.md) before judging every remaining candidate.
3. Inspect both occurrences and their surrounding module interfaces. Account for domain meaning,
   ownership, invariants, failure behavior, dependencies, transaction boundaries, and expected
   change cadence. Do not recommend extraction from similarity alone.
4. Ignore low-value mechanical resemblance. Group related occurrences and present at most three
   unresolved groups at once. For each group, show locations, evidence, meaningful differences,
   and one contextual recommendation.
5. Ask the user with the host's structured choice tool. Use `request_user_input` in Codex or
   `AskUserQuestion` in Claude Code when available; otherwise ask one concise blocking question.
   Put the recommended choice first and offer exactly these decisions:
   - reuse or extract the shared knowledge;
   - keep the implementations intentionally separate;
   - defer the decision.
6. Do not refactor before the user chooses reuse. If the current request does not authorize code
   changes, report the decision without editing.
7. For intentional separation or deferral, add the candidate ID, fingerprint, decision, and
   rationale to `.duplicate-logic-decisions.json`. A decision is valid only while both the ID and
   fingerprint match.
8. For an authorized reuse decision, choose the smallest owner-respecting seam, preserve public
   module boundaries, add or update behavior tests, and rerun the analyzer. The candidate must
   disappear or become materially dissimilar before the step is complete.
9. Run focused tests and `pnpm verify` after code changes. Report unresolved candidates and user
   decisions separately from deterministic verification results.

## Constraints

- Keep the analyzer advisory. CI may generate its report but must not require interactive input.
- Prefer two clear implementations over one abstraction that joins different domain knowledge.
- Do not create a shared module merely to reduce line count.
- Do not record a repository-wide exception when a narrower candidate decision is possible.
