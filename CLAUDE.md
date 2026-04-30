# CLAUDE.md

Guidance for Claude Code when working in **this** repository (`my-architect-marketplace`).

## What this repo is

A Claude Code **plugin marketplace** — a thin, public distribution layer. It ships one plugin (`my-architect`) containing one skill (`myarchitect`) and an auto-configured MCP server reference. There is no application code here.

The actual product (the My Architect app + the `@my-architect/mcp` server source) lives in a separate **private** repo (`my_architect`). This repo is intentionally minimal: a stable distribution surface that users can `git clone`-implicitly via `/plugin marketplace add d7561985/my-architect-marketplace`.

## Single source of truth

`plugins/my-architect/skills/myarchitect/SKILL.md` is the **only** source of truth for the skill content. Do not:

- Sync from `~/.claude/skills/myarchitect/SKILL.md` (that path is a personal install, not authoritative).
- Sync from the private product repo (it has no copy; if it does, it is stale).
- Maintain two copies of any skill content. Edit here, push here, users pull from here.

## When making any change

1. **Validate** before committing:
   ```bash
   claude plugin validate .
   ```
   The marketplace manifest, plugin manifest, and skill frontmatter must all parse.

2. **Bump the plugin version** in `plugins/my-architect/.claude-plugin/plugin.json`:
   - **patch** (`1.0.0 → 1.0.1`) — typos, doc-only fixes, refactor of skill prose without changing meaning.
   - **minor** (`1.0.0 → 1.1.0`) — new triggers in the skill, new workflows added, new MCP tools surfaced, new skill files added.
   - **major** (`1.0.0 → 2.0.0`) — breaking change in the decision rubric, removed workflows, renamed MCP env vars, anything that could surprise an existing install.

3. **Add a CHANGELOG entry** under a new `## [X.Y.Z] — YYYY-MM-DD` heading. Use today's date. List what changed in `### Added / Changed / Removed / Fixed` subsections.

4. **Commit and tag:**
   ```bash
   git add -A
   git commit -m "chore: release v<X.Y.Z> — <short summary>"
   claude plugin tag plugins/my-architect
   git push --follow-tags
   ```
   `claude plugin tag` validates that `plugin.json:version`, the marketplace entry, and the new git tag all agree before creating the tag `my-architect--v<X.Y.Z>`.

## Versioning is mandatory

Every user-visible change ships a new version. **Do not** push a SKILL.md edit without bumping the plugin version and CHANGELOG. Reason: users update via `/plugin update my-architect` which only acts when the version changes.

## Public-repo hygiene

- **No secrets ever.** No `MCP_API_KEY`, no GitHub tokens, no personal API keys, no `.env` files. The user's token is supplied via shell env at install time and stays on their machine.
- **No internal links.** Don't reference paths in the private product repo, internal Linear tickets, internal Slack threads, or anything not publicly accessible.
- **No personally-identifying user data** in examples — use generic placeholders (`<feature-id>`, `<commit-SHA>`, `<release-id>`).

## Skill content must stay universal

`SKILL.md` is consumed by users running their own My Architect projects. It must not assume:

- A specific project ID (resolved at runtime via the setup ladder in the skill itself).
- A specific epic structure (read live from `get_project_context`).
- A specific release labelling scheme (read from local project's CLAUDE.md or `get_project_context`).
- A specific title convention like `P<N>-tech-debt:` (mentioned as an example pattern, not as a rule).

If you find yourself wanting to hardcode something project-specific, stop — that signal belongs in the consuming project's CLAUDE.md, not in the skill.

## Coordinating with the private `my_architect` repo

When the MCP server (`@my-architect/mcp` in npm) changes:

| Change in product repo | Action here |
|---|---|
| New MCP tool added | Consider extending the skill workflows to use it; minor version bump. |
| MCP tool removed or renamed | Update SKILL.md references; major version bump (breaking). |
| MCP env var renamed (e.g. `MA_API_URL` → something else) | Update `mcpServers.env` in `plugin.json`; major version bump. |
| MCP server bumped to a new minor on npm | Usually no action — `@latest` in `mcpServers.args` picks it up. Verify nothing breaks. |
| Install instructions in product README change | Mirror them in this repo's README and vice versa. |

## What not to do

- **Don't `git push --force` to `main`.** This repo is public; rewriting history breaks all caches and existing installs.
- **Don't delete tags.** Once published, a version is immutable. Make a new patch instead.
- **Don't merge changes from the private repo without checking for secrets.** The private repo can mention internal paths or env vars that must not appear here.
- **Don't skip `claude plugin validate .`** No "fixes" are too small to validate.

## Quick reference

```bash
# Validate before any commit
claude plugin validate .

# Smoke test the install path locally
claude plugin marketplace add .                    # add this repo as a local marketplace
claude plugin install my-architect@my-architect-marketplace
claude plugin list                                 # confirm installed

# Release a new version
# 1. Edit + bump version in plugin.json + add CHANGELOG entry
# 2. Validate
# 3. Commit
# 4. Tag and push
git commit -am "chore: release v<X.Y.Z> — <summary>"
claude plugin tag plugins/my-architect
git push --follow-tags
```
