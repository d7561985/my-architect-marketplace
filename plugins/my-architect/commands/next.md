---
description: Claim the next eligible epic, select scoped child work and keep Architect current
---

Use the **myarchitect** skill. Resolve the project `pid` via the skill's setup ladder, then:

1. Read `references/epic-flow.md` and inspect actual remote capability with `get_epic_flow({pid})`. Missing tools, 404 or malformed responses are unavailable capability, not an empty queue. Init/read does not enqueue old epics.
2. Continue an appropriate current owned claim, or read `get_next_epic({pid})` and claim an eligible authorized epic through `apply_epic_flow_command` with fresh revision and a saved exact operationId/payload. A recommendation is not ownership. Preserve other owners; use exact replay after an unknown outcome, fresh reconciliation after a definite conflict.
3. In a project with flow entries, use `get_next_task({pid,scopeEpicId,claimId,assignee})` for the owned in-progress, nonwaiting epic. No global fallback on `EPIC_FLOW_SCOPE_REQUIRED`, no implicit capacity release, and `no_eligible_tasks` is not delivered. A verified compatible empty/unmanaged flow can retain legacy leaf selection. Scoped selection does not grant an atomic child claim.
4. Follow **Workflow D**: read the node, relevant docs/requirements and affected product features before coding. Check the applicable solution choice through `references/solution-discovery.md` before planning/code; refresh changed assumptions, not a full survey for each child. Start only ordinary authorized child work with the supported task tool; never `start_task` on the managed epic. Keep sources current via Workflow C and decompose accepted scope as needed.
5. Before child closure, complete **Trace** and **Workflow A**, explicitly update only proven requirements, refresh issue links/index and validate. Then choose the next child through the same owned scope; a `next_task:null` response is not permission to search globally. For the managed epic, collect current review evidence and follow its accepted policy/capability; legacy done, tests and merge do not establish delivery. Missing policy or verifier is reported precisely while independent authorized work continues.

Verify against the codebase before building — a draft node may already be shipped. Reconcile rather than duplicate.

$ARGUMENTS
