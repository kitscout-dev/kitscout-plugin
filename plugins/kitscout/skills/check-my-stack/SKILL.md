---
name: check-my-stack
description: Report on the user's installed agent tools (MCP servers and Claude Code plugins) - which fail to start on this machine, or are archived, deprecated, abandoned or down - and suggest replacements. Use when the user asks for the KitScout stack report, whether their MCP servers / plugins / tools are healthy, why a tool isn't working, or to turn KitScout anonymous health sharing on or off.
---

# KitScout stack report

1. Run `node "$HOME/.kitscout/guard.mjs" --report` from the project directory (the KitScout session-start hook keeps this copy current) and read the result. If it is older than today or the user just installed or removed a tool, first run `node "$HOME/.kitscout/guard.mjs" --refresh` (takes up to a minute: it runs `claude mcp list` and asks KitScout) and then `--report` again.
2. Tell the user, briefly, which tools need attention and why. Group: fails to start on this machine (a local setup problem: missing command, package, env var or credentials - suggest checking `claude mcp get <name>`), maker-level problems (archived, deprecated, abandoned, remote down).
3. For each maker-level problem, call the KitScout MCP tool `check_tools` with that tool's package id or URL to get official or better-maintained alternatives with install lines. Offer to switch; never remove or install anything without the user's OK.
4. Health sharing (off by default): if the user asks to share anonymous health data, run `node "$HOME/.kitscout/guard.mjs" --share-health on` (or `off`). It sends only, per public tool id, whether it started on this machine; it helps everyone see which tools are broken. Explain that before turning it on.

Only public ids (package names, server URLs without query strings, plugin names) are sent to KitScout; never env vars, arguments, keys or files. Policy: https://kitscout.dev/privacy
