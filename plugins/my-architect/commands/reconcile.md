---
description: Reconcile draft nodes against the codebase — close what's already shipped
---

Use the **myarchitect** skill. Resolve the project `pid`, then `get_project_context({ pid })` and sweep the **draft** nodes (MVP/R1 first):

1. For each draft node, verify against the actual codebase whether it's shipped — grep for the feature's routes, components, tests. Read before concluding.
2. **High confidence shipped** → `bulk_update_nodes` status `done` (validate the `successful` / `failed` arrays).
3. **Partial** (core done, sub-item missing) → keep draft, note exactly what's left.
4. **Not done** → leave draft.

Present a verdict table (shipped / partial / not-done) with evidence. Never mark a node done without code evidence — accuracy over closing count.

$ARGUMENTS
