# Changelog

All notable changes to the `my-architect` plugin are documented here.

This project follows [Semantic Versioning](https://semver.org/).

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
