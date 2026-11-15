# KitScout plugin and skill

Stop installing abandoned, unofficial or dead agent tools. KitScout checks MCP servers, Agent Skills and Claude Code plugins against an index of ~88,000 tools (daily live checks, publisher identity, GitHub activity) and probes remote servers live.

What you get:
- **`find-agent-tools` skill**: your agent splits a workflow into steps, finds candidates, and verifies each one before recommending it.
- **KitScout MCP server** (`https://mcp.kitscout.dev/mcp`, free, no key): `check_tools`, `search_tools`, `get_tool`, `list_categories`.

## Install

**Claude Code plugin** (skill + MCP server):
```
/plugin marketplace add kitscout-dev/kitscout-plugin
/plugin install kitscout@kitscout
```

**Skill only** (any agent that supports Agent Skills):
```
npx skills add kitscout-dev/kitscout-plugin --skill find-agent-tools
```

**MCP server only**:
```
claude mcp add --transport http kitscout https://mcp.kitscout.dev/mcp
```

## Example

> "I want a Slack message whenever a Jira issue is closed. Which tools should I use?"

The agent finds candidates per step, runs `check_tools` on them, and answers with a table: step, tool, verdict (`ok` / `caution` / `avoid`) with reasons, and the install line.

Why verify: in our test of 18 tools picked by plain web search, `check_tools` flagged the two weak picks (a 0-star repo untouched for 231 days, a 10-star scraper) and offered better-maintained alternatives, resolved three renamed repos, and left the 13 good picks alone.

## Privacy

The MCP server keeps an anonymous log of calls (time, country, client app name, the tools you searched or checked, and the results). No IPs, accounts or file contents. Policy: https://kitscout.dev/privacy

Source of the server: https://github.com/kitscout-dev/kitscout-mcp · Contact: contact@kitscout.dev · License: MIT
