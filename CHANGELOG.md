# Changelog

All notable changes to the `my-architect` plugin are documented here.

This project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-04-29

### Added
- Initial release of the `my-architect` plugin.
- Skill `myarchitect` — proactive backlog tracker that creates my_architect nodes for surfaced gaps (deferred / caveat / known issue), with a 3-lane decision rubric (tech-debt / future-with-trigger / strategic-ASK).
- Auto-configured MCP server `@my-architect/mcp@latest` via `mcpServers` in `plugin.json`. User supplies `MCP_API_KEY` from shell env; `MA_API_URL` defaults to `https://my-architect.app`.

### Compatibility
- Claude Code 2.0+
- `@my-architect/mcp` ≥ 1.2.1
- Node ≥ 20
