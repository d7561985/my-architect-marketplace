#!/usr/bin/env bash
# SessionStart: local facts only. Silent for healthy/non-Architect projects; no network or repairs.
set -uo pipefail
root="${CLAUDE_PROJECT_DIR:-$PWD}"
declares_architect_usage() {
  # Recognize known local declarations, not arbitrary prose or Markdown examples.
  awk '
    {
      line = $0
      sub(/\r$/, "", line)
      if (fence) {
        if (match(line, /^[ ]*(```+|~~~+)/)) {
          marker = substr(line, RSTART, RLENGTH)
          sub(/^[ ]*/, "", marker)
          if (substr(marker, 1, 1) == fence && length(marker) >= width && substr(line, RLENGTH + 1) ~ /^[ \t]*$/) fence = ""
        }
        next
      }
      if (comment) { if (line ~ /-->/) comment = 0; next }
      if (line ~ /^[ \t]*$/) { quote = 0; next }
      if (line ~ /^(    |\t)/) next
      sub(/^[ ]*/, "", line)
      if (sub(/^([-+*]|[0-9]+[.)])[ \t]+/, "", line)) quote = 0
      if (line ~ /^>/) { quote = 1; next }
      if (line ~ /^#+([ \t]|$)/) { quote = 0; next }
      if (match(line, /^(```+|~~~+)/)) {
        marker = substr(line, RSTART, RLENGTH)
        quote = 0
        fence = substr(marker, 1, 1); width = length(marker)
        next
      }
      if (quote) next
      if (line == "<!-- my-architect:traceability .architect/traceability.json -->") { found = 1; next }
      if (line ~ /<!--/) { if (line !~ /-->/) comment = 1; next }
      if (line ~ /^`[^`]*`[.]?$/) next
      gsub(/[`*]/, "", line)
      gsub(/[ \t]+/, " ", line)
      line = tolower(line)
      if (line ~ /^my[_-]architect pid *: *["\047][^"\047]+["\047]([. ]|$)/ ||
          line ~ /^use my[_-]architect get_project_context *\( *\{ *pid: *["\047][^"\047]+["\047]/ ||
          line ~ /^use my[_-]architect to track project work([.!]|$)/ ||
          line ~ /^my[_-]architect mcp project [^ ]/ ||
          line ~ /^canonical source: my[_-]architect mcp server, project [^ ]/) found = 1
    }
    END { exit !found }
  ' "$1"
}
is_architect() {
  [ -f "$1/.architect/traceability.json" ] && return 0
  [ -f "$1/.mcp.json" ] && grep -Eq '"my[_-]architect"[[:space:]]*:' "$1/.mcp.json" && return 0
  # A declaration can identify usage before pid/init; a brand mention cannot.
  [ -f "$1/CLAUDE.md" ] && declares_architect_usage "$1/CLAUDE.md" && return 0
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
