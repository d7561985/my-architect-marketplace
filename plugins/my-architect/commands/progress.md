---
description: Show my_architect project progress and route to the next action
---

Use the **myarchitect** skill. Resolve the project `pid`, then `get_project_context({ pid })` and read `references/epic-flow.md`. This is a read-only report, not permission to claim/reorder or migrate. Inspect `get_epic_flow`/`get_next_epic` when supported and report:

- Delivery queue: actual order, stage counts, owners, waits/next steps, review/policy/verifier gaps and the next eligible epic or real unavailability reasons.
- Legacy decomposition: done / in-progress / draft counts separately from delivered outcomes; per-release/epic child progress is not an acceptance percentage.
- Every active claim relevant to the requested scope; do not assume only one exists or invent a WIP limit.
- Next child recommendation only with an existing valid owned scope; never project-wide `get_next_task` in a managed project. Inspect bounded detail/history only where necessary and show truncation/unread-page limits.

Flag evidence gaps separately from legacy status drift. All children done with a managed epic still in review is not automatically rollup lag. HTTP 404 does not prove an empty queue, and missing verifier means delivery remains unconfirmed. Don't invent — read live state.

$ARGUMENTS
