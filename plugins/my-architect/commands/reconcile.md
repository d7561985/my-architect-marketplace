---
description: Reconcile draft nodes against the codebase — close what's already shipped
---

Use the **myarchitect** skill. Resolve the project `pid`, then `get_project_context({ pid })` and sweep the **draft** nodes (MVP/R1 first):

1. For each draft node, verify against the actual codebase whether it's shipped — grep for the feature's routes, components, tests. Read before concluding.
2. **High confidence shipped** → verify the skill's **Trace** step (`references/traceability.md`), then close through **Workflow A**: node completion, explicit `done` only for proven requirements, fresh `get_issues`, issue closure only when **all** links in nonempty `closedBy` are `done`, index sync and final validation in this turn. Keep partial issues open; legacy `approved` is not execution evidence. Missing permanent requirement tests, a CI gate or mutation evidence remain explicit gaps; code presence alone does not authorize `done`.
3. **Partial** (core done, sub-item missing) → keep draft, note exactly what's left.
4. **Not done** → leave draft.

Present a verdict table (shipped / partial / not-done) with evidence. Never mark a node done without code evidence — accuracy over closing count.

$ARGUMENTS
