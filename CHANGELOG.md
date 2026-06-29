# Changelog

All notable changes to the `my-architect` plugin are documented here.

This project follows [Semantic Versioning](https://semver.org/).

## [1.11.0] — 2026-06-29

### Added
- **Event Storming canvas guidance** in the `myarchitect` skill. A new `event-storming` diagram type for collaborative domain/event modeling: author it with `create_diagram({diagramType:'event-storming', dsl})` on an epic/initiative, or embed a ` ```event-storming ` block in a node doc. The DSL is line-based, agent-native and round-trippable — `group "Context"` swimlane frames (cards inside move together), nested `[event|command|policy|readmodel|actor|aggregate|external|hotspot] "label"` cards, free cards with an `@x,y` pin, and `connect "A" -> "B"` causal arrows. It can also be created from the hierarchy node menu. Documented in `references/forming-nodes.md`; positions it as the "where the HOW lives" for domain flow + open questions (hotspot = neon-pink rotated diamond), above box/ASCII relationship graphs.
- **Event Storming as a sequencing control (process rule + MCP).** New SKILL.md lifecycle rule: when working an **epic/initiative**, by default run Event Storming as a sub-task before code and re-validate the sequence during implementation (strong default; skip only for trivial 1–2-step nodes). Backed by the MCP surface — `create_diagram(nodeId:…)` authors the board on the node; `get_diagram` returns a `sequence` analysis surfacing story breaches (event with no cause, command with no resulting event, policy that doesn't bridge, isolated cards, unresolved hotspots); `update_diagram` refines it until `sequence.ok`. WHY: at the epic/initiative altitude this catches missing steps and wrong order before and during coding, and keeps open questions visible.

### Compatibility
- **Skill-text only, but gated:** requires an app + `@my-architect/mcp` build where the `event-storming` diagram type is registered AND the MCP tools `create_diagram(nodeId)`, `get_diagram` (sequence analysis), `update_diagram` ship (feature-006). Until it ships to my-architect.app, `create_diagram` rejects this type and the sequence tools are absent — do not advertise it as live before the app/MCP deploy (avoids the "done-locally-not-shipped" trap).

## [1.10.0] — 2026-06-25

### Added
- **Verify-before-elevate guidance** (story-078) in `references/forming-nodes.md` + a `Don't` in `SKILL.md`: a node that asserts an integration ("X reads via Y", "calls service Z") must be verified against the code BEFORE creation. Unverified → a `draft` with a `VERIFY:` marker, not a confident block — a fabricated integration in the tree is worse than its absence (it steers work wrong). Altitude is about value; this is about truth — both checked pre-`build_hierarchy`.
- **Design-doc location guidance** (story-079) in `SKILL.md` "Composes with": when the architect is the project workspace, final design docs live ON nodes via `create_doc` (Workflow C), not in a local `docs/superpowers/specs/` — `brainstorming` yields, so the source of truth is not split between repo and nodes. Notes `update_doc` `find`/`replace`/`section` for long-doc edits.
- **Decomposition evals** (story-076) — `evals/decomposition-evals.json`: 4 prose-feature prompts that grade the proposed `build_hierarchy` tree for *altitude* (building blocks vs task-slices), the behavioral regression net for story-074/075. Embeds the MM case + over-split, multi-block, and order-as-dependency cases. Documented in `evals/RESULTS.md`.

### Compatibility
- Skill-text only. Best paired with `@my-architect/mcp` ≥ 1.5.3 (update_doc patch edits, `add_requirements`, `get_project_context` summary view) shipped alongside.

## [1.9.0] — 2026-06-25

### Added
- **HTML-wireframe recommendation** in the `myarchitect` skill (`references/forming-nodes.md`, Altitude section): when a building block needs a UI wireframe or a conceptual block-diagram, **prefer** authoring it as a self-contained ```html fragment (inline CSS, no external scripts) in the node's doc — My Architect renders it as a live preview in an isolated `sandbox` iframe next to Documents, at higher fidelity than ASCII art, and keeps the artifact attached to the block. This is where the "how" lives for design. ASCII/`box`/`mermaid` stay for quick sketches and relationship graphs; conceptual screen layouts go to HTML. Motivated by the MM-test post-mortem (the "Layers" wireframe had to be drawn in low-fidelity ASCII).

### Changed
- **Altitude lint is now live, as a warning.** `build_hierarchy` / `update_node` return non-blocking `altitude_warnings` when a title leads with a code-artifact noun (Коллекция/Поле/Endpoint/Hook/Migration/…) or a task verb (добавить/создать/прокинуть/add/create/wire/…) — the title names an artifact or a step, not a building-block outcome. It complements the RFC-013 *formulation* lint (which hard-rejects): formulation catches *how a node is named*, altitude catches *how high it is sliced*. Re-name to the observable result; the artifact stays in the description. Requires `@my-architect/mcp` ≥ 1.5.2.

### Compatibility
- Skill-text + MCP-client change. The wireframe rendering ships in the My Architect app (sandboxed iframe for ```html blocks and node docs); the `altitude_warnings` ship in `@my-architect/mcp` ≥ 1.5.2.

## [1.8.0] — 2026-06-24

### Added
- **Feature-altitude guidance** in the `myarchitect` skill (story-074): a new **Altitude** section in `references/forming-nodes.md` teaches feature-as-**building-block** — the thinnest independently-shippable slice with an observable result (may cut across services), not a code-layer task. Adds the **merge-test** and **demo-test** (run pre-flight before `build_hierarchy`), result-not-artifact title grammar, "implementation + `file:line` → acceptance/doc, not child nodes" (anchors become impl-notes, never lost), cross-cutting≠feature, order = dependencies + releases, and a granularity-budget smell. A lean pointer from the core lifecycle map. Complements — does not replace — the RFC-013 formulation lint: that catches *how a node is named*, this catches *how high it is sliced*.

### Compatibility
- Skill-text only; no MCP/API change. The matching server-side title-lint extension (flagging artifact/task titles) ships separately.

## [1.7.0] — 2026-06-22

### Changed
- **Progressive-disclosure refactor of the `myarchitect` skill** (story-062): `SKILL.md` is now a lean ~100-line core (3 principles + setup ladder + always-first + the feature-lifecycle map as a *router* + decision rubric + Don't guardrails). The detailed procedures moved into `references/` and load on demand: `references/workflows.md` (full Workflow Z/D/A/B/C bodies + Description template + the `plan_release` note) and `references/forming-nodes.md` (preset/level model, granularity tests, title lint, `build_hierarchy`, `move_node`/`set_node_type`). Behaviour and the workflow letters (A/B/C/D/Z) are unchanged — the slash commands stay wired and the map tells the agent which reference to open at each step. All behavioural content preserved (verified token-by-token); regression-checked with trigger + behavioural evals (`evals/`).

### Compatibility
- No behavioural or API change — `description` (the trigger) is byte-identical. Same `@my-architect/mcp` requirements as 1.6.0.

## [1.6.0] — 2026-06-22

### Added
- **/my-architect:feature** command — the CREATE entry point of the lifecycle. A thin wrapper over Workflow Z: dispatches the new feature-author agent to turn prose into a proposed `build_hierarchy` tree + upfront requirements + optional doc, presents it, and writes only after you confirm (propose-then-confirm gate), then `validate_project` + echoes the created IDs.
- **Four plugin agents** (`agents/`, auto-discovered, each runs in its own context): **feature-author** (Workflow Z — the engine behind `/feature`), **reconciler** (verify draft nodes against the codebase and close what shipped, only with evidence), **debt-scanner** (Workflow A scan-for-gaps + Workflow B — file each surfaced deferred/caveat/known-issue, de-duped), **progress-auditor** (read-only status audit with drift flags; uses `disallowedTools` to stay read-only).
- **Debt-scan hook** (`hooks/hooks.json`): a single `PostToolUse` hook matched to the `complete_task` MCP tool (`mcp__plugin_my-architect_my-architect__complete_task`) that, on feature close, reminds Claude to run the scan-for-gaps pass and dispatch the debt-scanner. Exactly one hook, scoped to one tool — nothing fires on unrelated turns.
- Skill **drift-prevention guidance**: a **ship = sync** rule (any user-visible release — a feature-shipping commit or a tagged version — moves the matching node to its done/next status in the SAME turn) added to the lifecycle map and the Don't section; Workflow Z step 2 hardened so a shippable feature is never authored as one childless node (always ≥1 child slice per the project's `levelNames`), cross-referencing the new `validate_project` **status-rollup-lag** warning.

### Changed
- README: documents the commands, agents, and hook; clarifies that there is no marketplace-author auto-update toggle (auto-update is a per-user setting; the manual `/plugin update` path is reliable, and the MCP server always runs `@latest`).

### Compatibility
- No new MCP tools required. The `status-rollup-lag` warning is server-side (live on my-architect.app); the `delete_node` fix ships in `@my-architect/mcp` ≥ 1.5.1. Still requires `@my-architect/mcp` ≥ 1.5.0 for `move_node`/`set_node_type` + the title lint.

## [1.5.0] — 2026-06-16

### Added
- Skill **Workflow Z — Authoring a feature from scratch (CREATE)**: the missing front of the lifecycle — prose → `build_hierarchy` tree (feature + stories, tasks lazily) → **upfront requirements** (`add_requirement` FR/NFR/SAR/CON, no longer a deferred-only afterthought) → optional node doc (Workflow C) → release via `bulk_update_nodes` → `validate_project` + echo created IDs. Includes a story/task **breakdown heuristic** (when a feature needs stories, when a story needs tasks).
- Skill **"Feature lifecycle — the map"**: orders the workflows as Create (Z) → Work (D) → Close (A) → File deferred (B), with Docs (C) woven through. Authoring now **leads** the skill instead of closure.
- **Preset-aware hierarchy**: Forming-nodes, Workflow Z, and Setup now read the project's level scheme (fixed at init by the `scaffold_project` preset — `agile` Epic→Feature→Story→Task, `safe` Initiative→Epic→Feature→Story, `simple` Category→Item, or `custom`) instead of assuming the agile stack. Granularity tests carry across presets, and the skill won't invent a level absent from `levelNames` (e.g. SAFe has no Task). Verified against product source.

### Changed
- **Workflow D** moved into the WORK slot (after Z, before A) and now reads `get_requirements({inherited:true})` alongside the node docs before coding. Workflow **letters kept stable** (A/B/C/D) so the `/next`, `/doc`, `/progress`, `/reconcile` commands stay wired; the map — not the alphabet — defines the sequence.

### Compatibility
- No new MCP tools required. Still requires `@my-architect/mcp` ≥ 1.5.0 (for `move_node`/`set_node_type` + the title lint introduced in plugin 1.4.0).

## [1.4.1] — 2026-06-10

### Fixed
- README: token location updated to the new app UI — **API Keys** page (user menu → API Keys) replaces the old *Settings → Connect Agent* path. The app now also features a **Claude Skills** tab (first, recommended) on that page with the exact `/plugin marketplace add` + `/plugin install` commands from this README. Doc-only release; skill and plugin config unchanged.

## [1.4.0] — 2026-06-07

### Changed
- **Forming nodes** title rule sharpened to RFC-013: *name the entity (noun/outcome), not the work (verb/steps/acceptance/scope)*, with the real ❌→✅ rewrite. Adds lint awareness — `build_hierarchy` / `update_node` now **reject** step/scope/acceptance titles (arrow-pipelines, `+`-lists, `a/b/c`/`×` matrices, comma-lists, impl-in-parens, >10 words; `(RFC-NNN)` + single-arrow allowed), so the skill tells the agent to name it right the first time.

### Added
- **Reclassification guidance**: when a node is mis-typed or mis-placed, use `move_node` (re-parent, levels/type reconcile, cycle/depth guards) or `set_node_type` (relabel in place, refs preserved) instead of `delete_node` + recreate. Notes that `validate_project` surfaces ladder inversions (epic under a story).

### Compatibility
- Requires `@my-architect/mcp` ≥ 1.5.0 for `move_node` / `set_node_type` and the creation-time title lint.

## [1.3.0] — 2026-06-07

### Added
- Four slash commands (auto-discovered from `commands/`): **/my-architect:next** (pull + work the next task via Workflow D), **/my-architect:progress** (project progress + routing), **/my-architect:doc** (author/update a node's source-of-truth doc via Workflow C), **/my-architect:reconcile** (sweep draft nodes against the codebase, close what's already shipped). Thin prompt wrappers over the my_architect MCP flow + the myarchitect skill.

### Compatibility
- No new MCP tools required beyond 1.1.0's set; still requires `@my-architect/mcp` ≥ 1.4.0.

## [1.2.0] — 2026-06-05

### Added
- Skill section **Forming nodes — the hierarchy model**: level/granularity table (Epic → Feature → Story → Task, read live from `project.levelNames`), what makes a good node (outcome title, lead-with-fact description, correct parent + release, one granularity per node), and `build_hierarchy` to create a feature tree in one call before coding.
- Skill **Workflow D — Working a task against the architect**: the during-work loop — read the node + its docs before coding, form child nodes as scope emerges, `update_doc` the moment understanding changes, `validate_project` → `complete_task` at close.

### Changed
- Scope reframed: the skill now covers using the architect as a **living source of truth during work**, not only backlog touchpoints. New opening principle, during-work load triggers, narrowed "when NOT to load", and a `Don't` against letting a node/doc go stale (sync in-turn or mark `blocked`).
- `description` extended with during-work triggers (starting/implementing a tracked feature, forming a node tree, keeping a doc current).

### Compatibility
- No new MCP tools required beyond 1.1.0's set; still requires `@my-architect/mcp` ≥ 1.4.0.

## [1.1.0] — 2026-05-29

### Added
- Skill **Workflow C — Authoring docs as source of truth**: when to write a doc, the create / read / update / delete lifecycle, and the `validate_project` gate before `complete_task`. Covers `list_docs`, `get_doc`, `create_doc` (`nodeId` attaches), `update_doc`, `delete_doc` (`nodeId` detaches), `validate_project`.

### Compatibility
- Requires `@my-architect/mcp` ≥ 1.4.0 (new doc tools + `GET /api/projects/:pid/validate` route on the server).
- Plugin MCP config still resolves `@my-architect/mcp@latest`, so the new tools reach users automatically once the npm release publishes; no user-side change beyond updating the plugin to 1.1.0 for the new skill text.

## [1.0.1] — 2026-05-03

### Added
- `author` field in `plugin.json` (name, email, url) — silences the "No author information provided" warning from `claude plugin tag` and provides attribution metadata for the plugin registry.

### Changed
- No functional or behavioural changes. Skill content, MCP config, and decision rubric are unchanged from 1.0.0.

## [1.0.0] — 2026-04-29

### Added
- Initial release of the `my-architect` plugin.
- Skill `myarchitect` — proactive backlog tracker that creates my_architect nodes for surfaced gaps (deferred / caveat / known issue), with a 3-lane decision rubric (tech-debt / future-with-trigger / strategic-ASK).
- Auto-configured MCP server `@my-architect/mcp@latest` via `mcpServers` in `plugin.json`. User supplies `MCP_API_KEY` from shell env; `MA_API_URL` defaults to `https://my-architect.app`.

### Compatibility
- Claude Code 2.0+
- `@my-architect/mcp` ≥ 1.2.1
- Node ≥ 20
