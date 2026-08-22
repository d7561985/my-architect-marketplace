#!/usr/bin/env bash
# SessionStart hook — code-graph presence as a FACT, not a trigger to remember.
#
# Why this exists: a skill description can say "use me when graphify-out/ exists",
# but the model cannot evaluate that condition — only skill *descriptions* are in
# context at decision time, and checking the disk requires already deciding to look.
# Closed loop. This hook breaks it: if the graph is there, the session starts
# already knowing it, its freshness, and the composition rule. You cannot forget
# what is already in your context.
#
# Silent by design when there is no graph — zero cost for non-graphified projects.

set -uo pipefail

# --- locate the project root ---------------------------------------------------
root="${CLAUDE_PROJECT_DIR:-$PWD}"
if [ ! -f "$root/graphify-out/graph.json" ]; then
    # fall back to the git toplevel — hooks may run from a subdirectory
    git_root="$(git -C "$root" rev-parse --show-toplevel 2>/dev/null)" || git_root=""
    if [ -n "$git_root" ] && [ -f "$git_root/graphify-out/graph.json" ]; then
        root="$git_root"
    else
        exit 0   # no graph — say nothing
    fi
fi

graph="$root/graphify-out/graph.json"

# --- facts: build date, freshness vs HEAD ---------------------------------------
mtime="$(stat -f %m "$graph" 2>/dev/null || stat -c %Y "$graph" 2>/dev/null || echo 0)"
built="$(date -r "$mtime" +%Y-%m-%d 2>/dev/null || date -d "@$mtime" +%Y-%m-%d 2>/dev/null || echo unknown)"

# Freshness is decided by `built_at_commit` INSIDE graph.json, not by the file's mtime.
# mtime answers "was this file touched", which is a different question: any rebuild that
# bails out, any copy, any editor save moves it, and it says nothing about WHICH tree the
# index was extracted from. built_at_commit is written by every rebuild and compares exactly.
# mtime stays as the fallback for indexes built before the field existed.
stale_advice="Say so out loud, offer the owner \`graphify update .\` (and \`graphify hook install\` if no post-commit hook is installed). Mark every graph candidate \"from a stale index\" and draw no conclusion from it without verifying against the current file."

built_commit="$(grep -o '"built_at_commit"[[:space:]]*:[[:space:]]*"[0-9a-f]\{7,40\}"' "$graph" 2>/dev/null | head -1 | grep -o '[0-9a-f]\{7,40\}' | head -1)"
head_sha="$(git -C "$root" rev-parse HEAD 2>/dev/null || echo '')"
head_ct="$(git -C "$root" log -1 --format=%ct 2>/dev/null || echo '')"

if [ -z "$head_sha" ]; then
    fresh_line="freshness unknown — no git history to compare against; treat as possibly stale."
elif [ -n "$built_commit" ]; then
    if [ "$built_commit" = "$head_sha" ]; then
        fresh_line="fresh — built at HEAD."
    else
        fresh_line="STALE — built at ${built_commit} while HEAD is ${head_sha}. ${stale_advice}"
    fi
elif [ "$mtime" -lt "${head_ct:-0}" ] 2>/dev/null; then
    fresh_line="STALE — the index file predates HEAD (no built_at_commit field; judged by mtime). ${stale_advice}"
else
    fresh_line="fresh — not older than HEAD (no built_at_commit field; judged by mtime, which is weaker)."
fi

report=""
[ -f "$root/graphify-out/GRAPH_REPORT.md" ] && report=" Precomputed summary (god-nodes, communities, surprising connections, suggested questions): graphify-out/GRAPH_REPORT.md — read it before firing individual queries."

# --- the injected context -------------------------------------------------------
read -r -d '' ctx <<EOF
<code-graph-present>
This project is graphified. Index: graphify-out/graph.json (built ${built}, ${fresh_line})${report}

ANY task that needs understanding of this codebase beyond one already-known file —
architecture questions, "where is X implemented", "what breaks if I change Y", effort
estimation, audit, planning, review, onboarding docs, writing or updating CLAUDE.md
(including /init) — STARTS at the graph, before grep, before Read, before Workflow,
before fanning out agents:

  graphify query "<SYMBOL AND FILE NAMES>"   graphify explain "<symbol>"   graphify affected "<symbol>"

Query with SYMBOL NAMES, not prose. Measured A/B on the same question (9.5k-node index):
"LibraryModal kindLock onPick uploadArtifact" returned the exact files and functions;
"how does the user pick an image from the media library" returned marketing docs and an
unrelated README — zero code. Doc nodes are labelled with section headings and are nearly
as numerous as code nodes, so a natural-language query lands on headings and never reaches
the symbols. No names yet? Take them from GRAPH_REPORT.md or one narrow grep first.

The graph does NOT see symbols nested inside function bodies — the extractor emits
top-level declarations only. A 4131-line React component yielded 17 nodes, the last being
the component itself at L524: 3600 lines of body produced nothing. For fat files the graph
answers only "which file"; absence of a symbol in the graph is NOT evidence it is absent
from the code.

Does NOT apply to editing a single known file, or to a purely conversational turn.

Composition — the graph replaces the Discovery phase, not the whole run:
  graph      -> orientation and candidates (seconds, cheap)
  verify     -> a candidate arrives as path:line; read the region around it (+/-30 lines)
                in the live file. A fact is only what the current code confirms.
  Workflow / agents -> only for what the graph cannot know: runtime behavior,
                independent judgement, estimation, adversarial verification.

Honesty rule (non-negotiable): the graph tells you WHERE to look; it is never itself
the evidence. Indexes lag code between rebuilds — decisions are made from the code.

Full discipline: skill my-architect:recursive-context -> references/code-graph.md
</code-graph-present>
EOF

# --- emit (platform-specific field; Claude Code reads hookSpecificOutput) --------
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

escaped="$(escape_for_json "$ctx")"

if [ -n "${CURSOR_PLUGIN_ROOT:-}" ]; then
    printf '{\n  "additional_context": "%s"\n}\n' "$escaped"
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -z "${COPILOT_CLI:-}" ]; then
    printf '{\n  "hookSpecificOutput": {\n    "hookEventName": "SessionStart",\n    "additionalContext": "%s"\n  }\n}\n' "$escaped"
else
    printf '{\n  "additionalContext": "%s"\n}\n' "$escaped"
fi

exit 0
