---
name: find-agent-tools
description: Pick MCP servers, Agent Skills and Claude Code plugins that actually work, and verify them before installing. Use when the user asks which tool, MCP server, skill or plugin to use, wants to connect an app (Slack, Jira, Postgres, Stripe, ...), wants to automate a workflow and needs a tool per step, or is about to install a tool found on the web or in a README.
---

# Find and verify agent tools (KitScout)

Web search is good at finding candidates. It is bad at telling you which of them is abandoned, unofficial, renamed or down. KitScout checks that against its index of ~88k agent tools (daily live checks, publisher identity, GitHub activity) and probes remote servers live.

## Tools

Use the `kitscout` MCP server if it is connected (`check_tools`, `search_tools`, `get_tool`). Otherwise call it over HTTP, no key:

```bash
curl -s https://mcp.kitscout.dev/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_tools","arguments":{"tools":["https://github.com/owner/repo","@scope/package","https://mcp.example.com/mcp"]}}}'
```

## Workflow

1. Split the goal into steps (one product + one action each).
2. Find 1-3 candidates per step:
   - Product name known (Stripe, Notion, Sentry, GitHub, Jira): `search_tools` with the product name finds the maker's own server first.
   - Generic job (scrape pages, text to speech, docs lookup): use web search for what people recommend, plus `search_tools`.
3. Verify every candidate with `check_tools` (max 5 per call) before recommending or installing it.
   - `avoid`: archived, down, or abandoned for over a year. Do not install; take an alternative.
   - `caution`: low adoption, slow maintenance, not the maker's own tool. Prefer an alternative if one is listed; otherwise tell the user the risk.
   - `ok`: fine. If an `official` alternative is listed, mention it.
   - `moved_to`: the repo was renamed; use the new name.
4. Answer with a short table: step → tool → verdict and why (badges, stars, last change) → install/connect line. Mention where data goes for remote servers (`runs`).
5. Never invent tools. If nothing passes, say so.
