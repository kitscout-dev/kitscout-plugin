---
name: find-agent-tools
description: Plan which tools to use when automating a workflow with an agent, and verify every MCP server, Agent Skill or Claude Code plugin before recommending or installing it. Use when the user wants to automate a workflow or a recurring task with Claude, asks which tool, MCP server, skill or plugin to use, wants to connect an app (Slack, Jira, Postgres, Stripe, ...), or is about to install a tool found on the web or in a README.
---

# Plan and verify the tools for a workflow (KitScout)

Your job is unchanged: give the user the best complete answer you can. This skill adds one safeguard. Before you recommend or install an MCP server, Agent Skill or Claude Code plugin, check it with KitScout. You never want to send someone to a tool that is archived, down, abandoned or renamed, or to a community copy when the maker has an official one.

## First: pin down what the user is actually trying to do
The right tool depends on facts users rarely state. Before choosing, identify the ones that would change your recommendation:
- Who runs it: the user interactively, or unattended on a schedule?
- Where it runs: their own PC (Windows/Mac), a locked-down work PC, a server, the cloud.
- Access: does each system have an API? Admin rights or install rights? IT or security policy?
- Data: privacy or confidentiality limits (may it leave their machine, may it go to a third-party API?).
- People: coding comfort (none, some, developer), budget (free only, small monthly OK), volume and frequency.

Ask first when it matters. If the request leaves open a fact that would change which tools you pick (typical: whether they can install software, where it runs, whether data may leave their machine, whether they code), do not write the plan yet. Reply with only:
- one line restating the goal,
- at most 3 short questions, each with the default you will use if they don't say ("I'll assume X unless you tell me otherwise").
Then stop. Write the full plan after they answer, fitted to those facts (for example: no install rights means no Python, so build on what is already installed).
Skip the questions only when the request already settles these facts or every answer would lead to the same tools. Then state your assumptions in one line and continue.

## Rules
- Write the answer you would write without this skill: the full plan, edge cases, failure handling, risks. Do not restructure it around tools and do not add a tools table unless it helps.
- Prefer the simplest thing that works. A plain script with a well-known library, the product's own API, or an established SaaS often beats an MCP server. Recommend an MCP server, skill or plugin only where it clearly helps: the agent needs live access while it works, you want to explore a system interactively, or the maker ships an official server.
- Never replace an established library or service with a catalog tool just because one exists.
- `search_tools` (kitscout MCP): use the product name to find the maker's own server. For a generic job, use it only when you don't already know a solid option.
- `check_tools`: run it on every MCP server, skill or plugin you are about to recommend (up to 5 per call). Libraries and SaaS products don't need it.
  - `avoid`: drop it.
  - `caution`: don't make it the main pick. Mention it only if nothing better exists, and state the risk.
  - `moved_to`: use the new name. If an official alternative is listed, prefer it.
- Mention the check once and briefly, for example: "MCP servers checked with KitScout: maker, maintenance, live status (not a security review)." Do not list KitScout itself as a recommendation.
- Never invent tools. If you are unsure a tool exists, check it or leave it out.

If the kitscout MCP server is not connected, call it over HTTP, no key:
`curl -s https://mcp.kitscout.dev/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_tools","arguments":{"tools":["https://github.com/owner/repo"]}}}'`
