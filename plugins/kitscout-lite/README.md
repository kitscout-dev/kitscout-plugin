# KitScout (directory edition)

The KitScout plugin as listed in the Claude plugin directory: skills and the KitScout MCP server only, no scripts or hooks.

- **find-agent-tools**: plan which tools to use for a workflow. Claude first asks what changes the choice (where it runs, install rights, data limits, coding comfort), then checks every MCP server, skill or plugin it recommends with KitScout.
- **check-my-stack**: ask "are my MCP servers and plugins OK?" and Claude checks what you have installed: fails to connect here, archived, deprecated, renamed, abandoned or down, with better alternatives.
- **KitScout MCP server** (`https://mcp.kitscout.dev/mcp`): search ~90,000 MCP servers, Agent Skills and Claude Code plugins and verify them. Free, no account or key.

Want a warning at every session start when an installed tool breaks? Install the full plugin, which adds a session-start check: see the [main README](../../README.md).

Privacy: https://kitscout.dev/privacy · License: MIT
