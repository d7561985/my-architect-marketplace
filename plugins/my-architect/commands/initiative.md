---
description: Form an initiative through the 7-question gate — spine first, then epic text + nodes
argument-hint: "[initiative description]"
---

Use the **myarchitect** skill, **Workflow I** (Authoring an initiative). Resolve the project `pid` via the skill's setup ladder, then:

1. **Filter first.** Dispatch the **initiative-author** agent on the `$ARGUMENTS` prose. The agent applies the two-buckets filter (small bucket → "team cost, no initiative", STOP — a successful outcome; point to `/my-architect:feature`) and the brainstorming boundary (solution not designed yet → hand off to `superpowers:brainstorming`).
2. **Gate interview.** One question at a time, only the gaps — prose answers are decomposed by the agent and never re-asked. Facts rule: every answer marked fact / estimate (whose) / goal; a missing answer becomes a literal `[факт: <вопрос>]` placeholder, never plausible filler.
3. **PROPOSE-then-CONFIRM gate.** The agent presents the spine — 7 answers, one sentence each — and **WAITS for confirmation**. "Option 0 wins — don't do it" and "not now + review trigger" are legitimate endings, not failures.
4. **On confirm — write it:** epic text with the fixed section structure; nodes + requirements + doc in my_architect (live `levelNames`, single text canon); final self-pass against the stop-list from `references/initiative-gate.md`.
5. **Verify, don't claim silently.** `validate_project` → clean; echo created IDs and every unclosed `[факт: …]` placeholder as a publication blocker.

Never invent facts — a gap is a literal `[факт: …]` placeholder, not plausible filler. Keep this a thin wrapper; the logic lives in Workflow I and the rules in `references/initiative-gate.md`.

$ARGUMENTS
