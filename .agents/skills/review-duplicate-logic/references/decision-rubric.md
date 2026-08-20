# Duplicate Logic Decision Rubric

Duplication is repeated knowledge when multiple implementations must change together to preserve
the same rule. Similar syntax without shared knowledge is not sufficient.

## Reuse or extract

Recommend reuse when the occurrences have the same:

- domain meaning and vocabulary;
- inputs, outputs, invariants, and failure behavior;
- owner or an already-recognized shared owner;
- dependencies and transaction boundary;
- reason and expected cadence of change.

Extract the smallest meaningful behavior. Prefer a function or owner-provided interface over a
generic `shared`, `common`, or `utils` module.

## Keep intentionally separate

Recommend separation when any of these are materially different:

- aggregate or feature ownership;
- business reason for change;
- authorization, consistency, or transaction rules;
- error semantics or operational consequences;
- likely future evolution.

Structural similarity across separate features is often coincidental. Preserve the separation and
record the concrete reason rather than adding a suppression comment to source code.

## Defer

Recommend deferral when domain ownership or change cadence is not yet known. State what evidence
would resolve the decision. Do not use deferral to avoid an otherwise clear decision.

## Presenting a candidate

Present locations and evidence before the question. Explain the recommendation in one or two
sentences. Similarity scores rank review work; they never decide the outcome.
