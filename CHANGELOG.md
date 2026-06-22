# Changelog

All notable changes to the `my-architect` plugin are documented here.

This project follows [Semantic Versioning](https://semver.org/).

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
