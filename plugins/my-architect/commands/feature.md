---
description: Author a feature from scratch — propose a node tree, then write nodes + requirements + doc
argument-hint: "[feature description]"
---

Use the **myarchitect** skill, **Workflow Z** (Authoring a feature from scratch). Resolve the project `pid` via the skill's setup ladder, then:

1. **Propose, don't write yet.** Dispatch the **feature-author** agent to turn the `$ARGUMENTS` prose into a proposed `build_hierarchy` tree — one shippable top-level node plus a child per independent acceptance slice — using the project's **live** `levelNames` preset from `get_project_context` (never hardcode levels). Alongside the tree, draft the upfront requirements (`FR` behaviour, `NFR` quality/SLO, `SAR` arch constraint, `CON` hard constraint) and an optional doc outline if the logic is non-trivial.
2. **PROPOSE-then-CONFIRM gate.** Present the proposed tree + upfront FR/NFR/SAR/CON + optional doc to the user and **WAIT for confirmation**. Don't write anything until they approve (adjust on feedback). If the release/priority is contestable, apply the rubric (STOP & ask).
3. **On confirm — write it:** `build_hierarchy` for the tree; `add_requirement` on the feature node for each agreed requirement; `create_doc({ pid, nodeId })` if the logic is non-trivial (lead with the fact, add a **Source**); `bulk_update_nodes` to set release/priority across the new nodes (check the `successful` / `failed` arrays).
4. **Verify, don't claim silently.** `validate_project({ pid })` → clean, then echo the created IDs (feature / stories / requirements / doc). Only then is the feature authored.

Authoring leads the lifecycle — the tree is formed and confirmed *before* code, not backfilled. Keep this a thin wrapper; the logic lives in Workflow Z.

$ARGUMENTS
