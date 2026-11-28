# KitScout (directory edition)

The KitScout plugin as listed in the Claude plugin directory: skills and the KitScout MCP server only, no scripts or hooks.

- **find-agent-tools**: plan which tools to use for a workflow. Claude asks at most 2 short questions, only about the job itself (what should come out, from where, to where, how often), never about your setup. It checks every MCP server, skill or plugin it recommends with KitScout, and when the plan picks 2 or more tools it ends with one copyable "Set it all up" block and the context cost of the picked tools.
- **check-my-stack**: ask "are my MCP servers and plugins OK?" and Claude checks what you have installed: fails to connect here, archived, deprecated, renamed, abandoned or down, with better alternatives.
- **KitScout MCP server** (`https://mcp.kitscout.dev/mcp`): search about 100,000 MCP servers, Agent Skills and Claude Code plugins and verify them. Free, no account or key.

Want a warning at every session start when an installed tool breaks? Install the full plugin, which adds a session-start check: see the [main README](../../README.md).

Privacy: https://kitscout.dev/privacy · License: MIT
