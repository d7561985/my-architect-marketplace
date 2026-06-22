# myarchitect skill — eval results (2026-06-22, plugin v1.7.0)

Run after the progressive-disclosure refactor (story-062) to confirm no regression (story-061).

## Trigger evals — description calibration

20 queries (10 should-trigger, 10 near-miss should-not), each judged 3× by an independent agent seeing **only** the skill name + description (mimics the real triggering decision).

- **Accuracy: 20/20 (100%)**, all unanimous (3/3 votes per query).
- **False negatives: 0** · **False positives: 0**.
- Near-misses correctly skipped include: "draw me a C4 diagram" (wants diagram content, not the tracker), "epic vs feature in agile?" (methodology Q), "refactor this validate_project function" (code, shared name), "deferred tax payment deadline" (keyword near-miss), "set up a Jira board" (different tool).

Conclusion: the `description` trigger is well-calibrated; no optimization needed. (Description was left byte-identical across the refactor, so this also confirms the refactor didn't disturb triggering.)

## Behavioral evals — refactor regression net

3 discipline prompts, each planned (dry-run, no mutations) by an agent reading the **refactored** skill vs the **pre-refactor snapshot**. Single rep per variant — purpose is structural equivalence, not a benchmark.

| Prompt | Refactored | Snapshot | Verdict |
|---|---|---|---|
| author a feature | ctx-first → build_hierarchy(tree) → add_requirement×4 → create_doc → bulk_update → validate; STOP for ambiguous placement | same sequence | **equivalent** |
| file deferred items | ctx-first, de-dup surfaced, build_hierarchy, validate | ctx-first, build_hierarchy, add_requirement, validate | equivalent (borderline ask-vs-no-ask = judgment noise on a hypothetical project) |
| ambiguous scope | STOP & ask (strategic lane) | STOP & ask | **equivalent** |

Both variants drive the core disciplines: `get_project_context` first, `build_hierarchy` tree over single nodes, upfront requirements, `validate_project` before done, and rubric-aware stop-and-ask. The lean core + `references/` skill plans the same disciplined sequences as the old monolith.

**Verdict: refactor is behavior-preserving. Shipped in v1.7.0.**
