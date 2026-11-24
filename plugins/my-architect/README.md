# My Architect plugin

My Architect keeps a project's plan, requirements, issues and diagrams in one model that people and AI agents share. This plugin teaches Claude how to work with that model: it reads the relevant context before changing code, records deferred work and known issues instead of losing them, keeps requirements and tests linked, and claims, reports and delivers work through the shared queue. One install brings the skills, agents, commands and hooks together with the My Architect MCP server.

## Install

### Claude Desktop, claude.ai and Cowork

1. Open **Customize → Plugins → Add → Add marketplace** and enter `d7561985/my-architect-marketplace`.
2. Install **my-architect**.
3. On the plugin's **Connectors** tab press **Connect**, sign in to My Architect with Google and press **Allow**.

A plugin installed in your Claude account also appears in Claude Code when you sign in there with the same account. Run `/reload-plugins` or restart Claude Code to load it.

### Claude Code only

```text
/plugin marketplace add d7561985/my-architect-marketplace
/plugin install my-architect@my-architect-marketplace
```

Then run `/mcp`, choose `my-architect`, select **Authenticate** and allow access in the browser.

Install the plugin in one place: either in your Claude account, which syncs it into Claude Code, or in Claude Code directly. Installing it both ways loads it twice.

## How it connects

The MCP server is `https://my-architect.app/mcp`. You sign in once with your Google account and approve the app on a consent screen; no API key is stored in the plugin or in your environment. You can see and disconnect every connected app in My Architect under **API Keys → Connected apps**. For headless use with an API key, add a separate server with an `Authorization` header as described in the [connection guide](https://my-architect.app/docs/connect-ai-agent/).

## What runs where

Skills work in Claude chat, Cowork and Claude Code. Agents and hooks run in Cowork and Claude Code. The hooks read the `.architect` folder of the repository you work in and only report what they find; they do not change files.

## Privacy and support

The plugin sends requests only to My Architect. Read the [privacy policy](https://my-architect.app/privacy.html) for how project data is handled. Documentation lives at [my-architect.app/docs](https://my-architect.app/docs/), and questions or problems go to [GitHub issues](https://github.com/d7561985/my-architect-marketplace/issues).

## License

MIT
