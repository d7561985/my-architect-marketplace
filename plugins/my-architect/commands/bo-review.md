---
description: Business-Owner review of an epic/initiative — read-only findings table, author applies fixes
argument-hint: "[epic file path | doc/node id]"
---

Use the **myarchitect** skill, **Workflow R** (Business-Owner review). Dispatch the **initiative-reviewer** agent on `$ARGUMENTS` — a file path, or a my_architect doc/node id (resolve `pid` via the skill's setup ladder when needed):

1. The agent runs the five checks from `references/initiative-gate.md` (generic phrases + reversibility test; было→станет + no borrowed delta; status-quo test; "if we don't do it" measurability; internal contradictions & register) plus the `[факт: …]` blocker scan.
2. Output is a findings table: **quote → why it's weak (which gate rule) → proposed fix built only from facts already in the doc → `needs_user_fact`** — quotes, never line numbers. It ends with a score: N blockers / M recommendations.
3. **Read-only.** The agent never edits the text or the project. Apply the fixes yourself (or ask to apply the approved ones as a separate step), then re-run `/my-architect:bo-review`.

Keep this a thin wrapper; the logic lives in Workflow R and the rules in `references/initiative-gate.md`.

$ARGUMENTS
