---
description: Pull the next task from my_architect and work it as a living source of truth
---

Use the **myarchitect** skill. Resolve the project `pid` via the skill's setup ladder, then:

1. `get_next_task({ pid })` — take the next leaf task.
2. Follow **Workflow D** (working a task against the architect): `start_task`, then read the node + its docs (`get_node` → `get_doc`) before writing code; author or refresh the source-of-truth doc (Workflow C) if the feature's logic isn't captured anywhere; form child nodes with `build_hierarchy` as scope emerges; keep the doc current with `update_doc` as understanding changes.
3. Before closing: complete the skill's **Trace** step (`references/traceability.md`), then **Workflow A**: complete the node, explicitly mark only proven requirements `done`, read fresh `get_issues`, and close an issue only when its nonempty `closedBy` contains **all** `done` statuses. Keep partial issues open; `approved` is not `done`. Refresh the derived index and validate in this same turn. A local smoke alone does not satisfy Trace.

Verify against the codebase before building — a draft node may already be shipped. Reconcile rather than duplicate.

$ARGUMENTS
