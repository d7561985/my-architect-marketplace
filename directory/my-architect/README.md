# My Architect plugin

My Architect keeps a project's plan, requirements, issues and diagrams in one model that people and AI agents share. This plugin teaches Claude how to work with that model: it reads the relevant context before changing code, records deferred work and known issues instead of losing them, keeps requirements and tests linked, and claims, reports and delivers work through the shared queue. One install brings the skills, agents and commands together with the My Architect MCP server.

## Install

1. In Claude Desktop, claude.ai or Cowork open **Customize → Plugins**, find **My Architect** in the directory and install it.
2. On the plugin's **Connectors** tab press **Connect**, sign in to My Architect with Google and press **Allow**.

A plugin installed in your Claude account also appears in Claude Code when you sign in there with the same account. Run `/reload-plugins` or restart Claude Code to load it, then use `/mcp` to check that `my-architect` is connected.

## How it connects

The MCP server is `https://my-architect.app/mcp`. You sign in once with your Google account and approve the app on a consent screen; the plugin stores no key and reads nothing from your environment. You can see and disconnect every connected app in My Architect under **Connect agents → Connected apps** in the account menu.

## Directory edition

This is the edition published in the Anthropic plugin directory. It has the skills, agents, commands and the MCP connection, but no hooks and no helper scripts. The full edition from the `d7561985/my-architect-marketplace` marketplace adds checks at the start of each Claude Code session and the scripts behind `/my-architect:init` traceability and migration packages. Install one edition only; installing both loads the skills twice.

## Privacy and support

The plugin sends requests only to My Architect. Read the [privacy policy](https://my-architect.app/privacy.html) for how project data is handled. Documentation lives at [my-architect.app/docs](https://my-architect.app/docs/), and questions or problems go to [GitHub issues](https://github.com/d7561985/my-architect-marketplace/issues).

## License

MIT
