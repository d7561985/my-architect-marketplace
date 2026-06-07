# Changelog

All notable changes to the `my-architect` plugin are documented here.

This project follows [Semantic Versioning](https://semver.org/).

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
