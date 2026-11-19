---
name: find-agent-tools
description: Use whenever the user asks how to build or automate something - a program, bot, script, pipeline, integration or workflow ("I want to make a program that...", "how do I automate...", "where do I start?", in any language) - even when the answer seems clear from general knowledge, because ready-made MCP servers, Agent Skills and Claude Code plugins may already do some of its steps. Also use when the user asks which tool, MCP server, skill or plugin to use, wants to connect an app, or is about to install a tool found on the web. Narrows the job, then finds and verifies those tools with KitScout per step.
---

# Plan with ready-made tools (KitScout)

People describe a build broadly ("auto-make and upload Shorts", "move SAP data into our WMS"). Plain answers jump to "write Python with library X". Better answers narrow the job, then use what already exists: an official API or library where that is simplest, and a ready-made agent tool where it saves real work (an MCP server that already talks to the system, a skill that knows the procedure, a plugin that bundles the setup).

## 1. Narrow the job (only what changes the plan)
Before planning, check: do you know (a) the end result and (b) every system it touches (source, destination)?
- Both known: ask nothing. State your reading in one line and continue.
- Either open: ask at most 2 short questions in one message, with everyday options plus "something else", then wait.
- Ask only about the job: what should come out, from where, to where, how often. Never about install rights, OS, where it runs, current tool inventory, data policy, budget or skill level. If such a fact decides between two approaches, give both in one line each (e.g. "if SAP GUI scripting is enabled: ...; if not: ...").

## 2. Buy or build, then break it into steps
- If an established product already does the whole job for this user's size (e.g. invoice capture apps for accounting, an ATS for hiring), say so in one line first, then give the build plan for those who want their own.
- Write the job as 3-6 concrete steps (get data -> transform -> act -> report). Cover every source and system the user named (each named site, database, app); keep only steps the user needs.

## 3. Search KitScout per step
- `search_tools` for each step that touches a product or a common task: query = product + action, a few words ("sap gui scripting", "youtube upload", "pdf invoice extract", "playwright browser").
- Keep a found tool only if it beats the plain way for this user: less code, access the plain way lacks (official API, a logged-in browser, a desktop app), or a maintained procedure. An established library or SaaS that does the step well stays the main pick; never swap it for a catalog tool just because one exists.
- `check_tools` on every MCP server, skill or plugin you will name (up to 5 per call): `avoid` = drop; `caution` = not the main pick, state the risk; `moved_to` = use the new name. Little adoption (well under ~100 GitHub stars, unknown maker) = never the main pick; name it only as an option when nothing established exists, with that caveat.
- Never invent tools. If unsure a tool exists, check it or leave it out.

## 4. Answer
1. Goal in one line.
2. Steps, each with: the approach (library, API or service) and, where it helps, the ready-made agent tool and what it saves ("Playwright MCP lets Claude click through the WMS while you build the script"). Install or connect line for each tool.
3. Where to start: the first concrete thing to do today.
4. The one or two things most likely to break (logins, rate limits, ToS, UI changes).
One main pick per step, at most one alternative with when to choose it. Mention the check once: "Tools checked with KitScout (maker, maintenance, live status; not a security review)." Do not list KitScout itself as a pick.

If the kitscout MCP server is not connected, call it over HTTP, no key:
`curl -s https://mcp.kitscout.dev/mcp -H 'content-type: application/json' -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_tools","arguments":{"query":"sap gui scripting"}}}'`
