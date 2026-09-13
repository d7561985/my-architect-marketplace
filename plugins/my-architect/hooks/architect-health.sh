#!/usr/bin/env bash
# SessionStart: local facts only. Silent for healthy/non-Architect projects; no network or repairs.
set -uo pipefail
root="${CLAUDE_PROJECT_DIR:-$PWD}"
is_architect() {
  [ -f "$1/.architect/traceability.json" ] && return 0
  [ -f "$1/.mcp.json" ] && grep -Eq '"my[_-]architect"[[:space:]]*:' "$1/.mcp.json" && return 0
  # Usage is enough to check for gaps; resolving the required MCP pid belongs to init.
  [ -f "$1/CLAUDE.md" ] && grep -Eq 'my[_-]architect' "$1/CLAUDE.md" && return 0
  return 1
}
if ! is_architect "$root"; then
  git_root="$(git -C "$root" rev-parse --show-toplevel 2>/dev/null)" || git_root=""
  if [ -n "$git_root" ] && is_architect "$git_root"; then root="$git_root"; else exit 0; fi
fi
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Architect health gap: Node.js is unavailable; run /my-architect:init to set up traceability.'
  exit 0
fi
plugin_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_PROJECT_DIR="$root" node "$plugin_root/scripts/traceability.mjs" health
exit 0
