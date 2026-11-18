---
name: check-my-stack
description: Check the user's installed agent tools (MCP servers and Claude Code plugins) - which fail to connect on this machine, or are archived, deprecated, renamed, abandoned or down - and suggest replacements. Use when the user asks whether their MCP servers, plugins or tools are healthy, why a tool isn't working, or for a KitScout stack check.
---

# KitScout stack check

1. List what is installed.
   - MCP servers: run `claude mcp list` from the project directory. Each line shows a server, its command or URL, and whether it connected on this machine.
   - Plugins: read `~/.claude/plugins/installed_plugins.json` (the keys under "plugins").
2. Find each tool's public id: the npm or PyPI package in its command (`npx -y @scope/pkg` gives `@scope/pkg`, `uvx pkg` gives `pkg`), a remote server's URL without its query string, or the plugin name. Skip local script paths. Never send arguments, environment variables, keys or file paths.
3. Call the KitScout MCP tool `check_tools` with those ids, up to 5 per call.
4. Tell the user briefly which tools need attention and why, in two groups:
   - Fails to connect on this machine: a local setup problem (missing command, package, environment variable or credentials). Suggest `claude mcp get <name>`.
   - Maker-level problems from check_tools: archived, deprecated, renamed (moved_to), abandoned, remote down. Give the official or better-maintained alternative with its install line.
5. Offer to switch. Never remove or install anything without the user's OK.

Only public ids are sent to KitScout. Policy: https://kitscout.dev/privacy

To get this check automatically at every session start, install the full KitScout plugin from https://github.com/kitscout-dev/kitscout-plugin
