# my-architect-marketplace

Official Claude Code plugin marketplace for **[My Architect](https://my-architect.app)** — visual architecture diagrams with AI integration via MCP.

Install once and you get:
- The `myarchitect` skill — Claude proactively tracks deferred items, caveats, and known issues as my_architect backlog nodes, and asks before making ambiguous priority calls.
- Auto-configured MCP server — `@my-architect/mcp` is wired up automatically; you only supply your API token.

---

## Prerequisites

1. A My Architect account at [my-architect.app](https://my-architect.app).
2. An API token from the **API Keys** page (user menu → API Keys).
3. Claude Code (CLI or IDE extension).
4. Node.js ≥ 20 (for the bundled MCP server).

---

## Install

### 1. Set your API token

Export the token in the shell from which you launch Claude Code:

```bash
export MCP_API_KEY=mcp_YOUR_TOKEN
```

Make this permanent by adding the line to `~/.zshrc` / `~/.bashrc` / equivalent.

### 2. Add the marketplace and install the plugin

In Claude Code:

```
/plugin marketplace add d7561985/my-architect-marketplace
/plugin install my-architect@my-architect-marketplace
```

### 3. Verify

```
/mcp
```

You should see `my-architect` listed and connected. The skill `myarchitect` becomes available automatically — Claude will load it when surfacing deferred items, closing features, or asked about the backlog.

---

## What's in the plugin

```
plugins/my-architect/
├── .claude-plugin/
│   └── plugin.json     # MCP server config + plugin metadata
└── skills/
    └── myarchitect/
        └── SKILL.md    # Proactive backlog tracker skill
```

**MCP server (auto-configured):** `npx -y @my-architect/mcp@latest` with `MCP_API_KEY` from your shell env and `MA_API_URL=https://my-architect.app`.

**Skill `myarchitect`:** triggers when you (or Claude) say "deferred", "known issue", "caveat", "not yet wired", "to be tested when…", "could improve later", or after closing a feature. Encodes the workflow:
- Always start with `get_project_context` to load live state.
- Closing a feature → `complete_task` + scan commit + chat for surfaced gaps.
- Each gap → de-dup against backlog → file via `build_hierarchy` + assign release via `bulk_update_nodes` (validate `successful` vs `failed`).
- Decision rubric: tech-debt → no ask, future-with-trigger → no ask, strategic/scope → **ask before filing**.

---

## Updating

When a new plugin version is released:

```
/plugin marketplace update my-architect-marketplace
/plugin update my-architect
```

---

## Configuration

| Env var | Required | Default | What it controls |
|---|---|---|---|
| `MCP_API_KEY` | yes (production) | — | Your API token from the API Keys page |
| `MA_API_URL` | no | `https://my-architect.app` | Backend URL — override only for local development |

To override `MA_API_URL` (e.g. local dev against `http://localhost:3100`), edit your project's `.mcp.json` after installation, or add an env line to your shell rc file.

---

## Troubleshooting

**`/mcp` shows my-architect as disconnected.**
Check `MCP_API_KEY` is exported in the shell where Claude Code was launched. Restart Claude Code after setting the var — env is read at process start.

**Plugin install fails with "marketplace not found".**
Confirm the marketplace is added: `/plugin marketplace list`. Re-add if missing: `/plugin marketplace add d7561985/my-architect-marketplace`.

**Skill doesn't load when expected.**
The skill description triggers on specific phrases (deferred, known issue, caveat, etc.). You can force-load it with `/myarchitect` or check `/skills` to confirm it's installed.

---

## Compatibility

- Claude Code 2.0+
- `@my-architect/mcp` ≥ 1.2.1

---

## Versioning

This plugin uses semantic versioning. The current version is in [`plugins/my-architect/.claude-plugin/plugin.json`](./plugins/my-architect/.claude-plugin/plugin.json). See [CHANGELOG.md](./CHANGELOG.md) for release history.

---

## Maintaining this repository

This repo is a Claude Code plugin marketplace — a thin distribution layer. There is one plugin (`my-architect`) and one skill (`myarchitect`). The skill content (`SKILL.md`) lives here as the **single source of truth** — do not maintain copies in `~/.claude/skills/` or in the private product repo.

### Repo layout

```
.claude-plugin/marketplace.json          ← marketplace manifest (owner, plugin list)
plugins/my-architect/
├── .claude-plugin/plugin.json           ← plugin manifest + mcpServers config + version
└── skills/myarchitect/SKILL.md          ← skill source of truth
CHANGELOG.md                             ← release history (semver)
README.md                                ← user-facing docs (this file)
CLAUDE.md                                ← guidance for Claude when editing this repo
```

### Release workflow

When changing the skill or plugin config:

1. **Edit** the relevant file (`SKILL.md`, `plugin.json`, etc.).
2. **Bump `version` in `plugin.json`** — semver:
   - **patch** for typos, doc fixes, non-behavioural tweaks
   - **minor** for new triggers, additional workflows in the skill, new MCP tools surfaced
   - **major** for breaking changes in the decision rubric, removed workflows, or MCP config that breaks existing installs
3. **Add a CHANGELOG entry** — date + bullets under a new `## [X.Y.Z] — YYYY-MM-DD` heading.
4. **Validate locally:**
   ```bash
   claude plugin validate .
   ```
5. **Commit** with a message like `chore: release v<X.Y.Z>` summarising the change.
6. **Tag the release** — Claude Code's CLI verifies that `plugin.json` and the marketplace entry agree:
   ```bash
   claude plugin tag plugins/my-architect
   git push --follow-tags
   ```
   This produces a tag of the form `my-architect--v<X.Y.Z>`.

Users pick up the new version via `/plugin marketplace update my-architect-marketplace` followed by `/plugin update my-architect`.

### Adding a new skill (future)

```bash
mkdir -p plugins/my-architect/skills/<new-skill-name>
$EDITOR plugins/my-architect/skills/<new-skill-name>/SKILL.md
```

`SKILL.md` must start with YAML frontmatter `name:` + `description:`. Bump plugin version (minor) and add a CHANGELOG entry. Skills are discovered automatically — no plugin.json edit needed unless you also need to add commands/hooks/agents.

### Coordinating with the private product repo

The MCP server (`@my-architect/mcp`) lives in the private product repo and is published to npm. Changes there can affect this plugin:

- **New MCP tool added** — consider updating `SKILL.md` to mention it where useful.
- **MCP env vars renamed** — update `mcpServers.env` in `plugin.json` and bump major version (breaking change for existing installs).
- **MCP API changes** — verify the workflows in `SKILL.md` still match (`get_project_context`, `complete_task`, `bulk_update_nodes`, etc. are referenced by name).

Conversely, when the install instructions change here, update `packages/mcp/README.md` in the product repo to match.

### What not to do

- **Never put `MCP_API_KEY` (or any user token) in `plugin.json` or this repo.** It comes from the user's shell env. The repo is public.
- **Don't reference the private product repo path** in `SKILL.md` — the skill must work for any user, not just this maintainer.
- **Don't skip `claude plugin validate .`** before push. Invalid manifests break installs silently for everyone.

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Links

- Product: [my-architect.app](https://my-architect.app)
- MCP server (npm): [`@my-architect/mcp`](https://www.npmjs.com/package/@my-architect/mcp)
- Issues: file in this repo
