# Project setup and health detection implementation plan

> **For agentic workers:** Use `superpowers:executing-plans` to execute the checked tasks. The user has approved implementation and publication.

**Goal:** Detect actual Architect use without prose false positives, then guide repository owners through project selection or creation and durable local binding.

**Architecture:** The local health hook reports facts and points to `/my-architect:init`. The skill resolves identity with user selection when no explicit binding exists, and the existing installer persists the selected project ID. Project listing/creation use existing MCP tools; no server-side Git association is introduced.

**Tech Stack:** Existing Bash/Node.js hook and scripts; Markdown skill; Node test runner. No new packages.

**Spec:** User-approved follow-up: reject prose-only detection; offer existing/new project when unbound; reuse confirmed bindings; preserve repository data; verify and publish necessary plugin/MCP changes.

## Constraints

- Detection does not infer `pid`, access the network, or modify projects.
- A project list's length/order does not identify the current repository.
- A failed list is not an empty list. Creation uses explicit user intent and no sample content.
- Persist exact returned IDs, preserve existing instructions/index IDs, and report incomplete setup honestly.
- Keep the historical acceptance report separate from new evidence.

## Task 1: Health detection and guidance

Files: `plugins/my-architect/hooks/architect-health.sh`, `scripts/traceability.mjs`, `tests/traceability.test.mjs`.

- [x] Add literal input/output hook cases: active declarations without init warn; comparisons, repository references, negations, quoted/fenced examples, and bare names stay silent.
- [x] Run `node --test plugins/my-architect/tests/traceability.test.mjs`; observe false positives before changing production code.
- [x] Recognize constrained usage declarations; preserve configured/healthy/nested-root behavior.
- [x] Make missing-setup output describe `/my-architect:init`, existing/new selection, reuse of a confirmed binding, and sync/tests/CI.
- [x] Verify green and isolated detector mutations in both directions.

## Task 2: Setup instructions and persistence

Files: `skills/myarchitect/SKILL.md`, `skills/myarchitect/references/setup.md`, `commands/init.md`, `README.md`, `skills/myarchitect/evals/setup-evals.json`, `skills/myarchitect/evals/SETUP_RESULTS.md` under `plugins/my-architect/` except root README.

- [x] Run pre-change agent scenarios: the single unrelated project is automatically selected by 1.19.1, demonstrating the failure.
- [x] Replace the automatic selection rule with a factual selection/creation workflow and clear user wording.
- [x] Read both config and instructions for conflicts; reuse explicit identities; distinguish absent setup from absent project.
- [x] Persist the verified identity locally, reuse it after restart, and explain empty-project/connection limitations.
- [x] Run fresh-agent scenarios A–G from `setup-evals.json`; inspect actual actions, not keyword matches. Record dry-run limits.

## Task 3: Consistent MCP help and release

- [x] Correct `list_projects` help: sorting by recency cannot establish repository identity. Verify real `tools/list` output.
- [x] Validate plugin, executable tests, JSON, and clean diffs; independently review the changes.
- [x] Prepare versions/changelogs for plugin and the necessary MCP help correction.
- [x] Run the source hook on an actual using repository and a prose-only repository.

## Release procedure

After committing the reviewed changes, publish both tags, verify registry and CI, update the installed plugin, rerun its hook, and append current evidence to the source proposal. Publication evidence is recorded in the GitHub release notes separately from this pre-publication implementation checklist.
