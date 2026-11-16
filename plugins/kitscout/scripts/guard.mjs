#!/usr/bin/env node
// KitScout stack guard: keeps an eye on the agent tools installed in Claude Code (MCP servers + plugins).
//   node guard.mjs            SessionStart hook: prints the last result instantly, starts a background refresh at most once a day
//   node guard.mjs --refresh  background: `claude mcp list` (does each server start HERE?) + KitScout daily data (archived, deprecated,
//                             abandoned, remote down) -> ~/.kitscout/stack.json
//   node guard.mjs --report   full report as text (used by the check-my-stack skill)
// Privacy: only public ids leave this machine (npm/pypi/docker package names, server URLs without query strings or secret-looking
// path parts, plugin names). Never env vars, headers, arguments or file contents. Policy: https://kitscout.dev/privacy
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const VERSION = "1.1.0", API = "https://mcp.kitscout.dev", CLIENT = "kitscout-plugin/" + VERSION;
const DIR = path.join(os.homedir(), ".kitscout"), CONF = path.join(DIR, "config.json");
// project-scoped MCP servers differ per project: one result file per project directory
const PROJECT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CACHE = path.join(DIR, "stack-" + createHash("sha1").update(path.resolve(PROJECT).toLowerCase()).digest("hex").slice(0, 12) + ".json");
const REFRESH_MS = 20 * 3600e3, NAG_MS = 20 * 3600e3;
const read = f => { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } };
const write = (f, o) => { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 1)); };

// ---------- public ids (never secrets)
const secretish = seg => seg.length >= 20 && /\d/.test(seg) && /[a-z]/i.test(seg) || /^(sk|pk|key|tok|token|api)[-_]/i.test(seg);
function safeUrl(u) {
  try {
    const x = new URL(u);
    const p = x.pathname.split("/").map(s => (secretish(s) ? "*" : s)).join("/").replace(/\/+$/, "");
    return x.protocol + "//" + x.host + p;  // no user:pass, query or fragment
  } catch { return null; }
}
export function idOf(target) {
  const t = String(target || "").trim();
  if (/^https?:\/\//i.test(t)) return safeUrl(t.split(/\s+/)[0]);
  const parts = t.split(/\s+/), exe = path.basename(parts[0] || "").toLowerCase().replace(/\.(cmd|exe|bat)$/, "");
  const after = from => parts.slice(from).find(p => !p.startsWith("-"));
  const npm = p => p && /^(@[\w.-]+\/)?[\w.-]+(@[\w.^~<>=*-]+)?$/.test(p) ? "npm:" + p.replace(/(?<=.)@[^/@]*$/, "") : null;
  if (["npx", "bunx", "pnpx"].includes(exe)) return npm(after(1));
  if ((exe === "pnpm" || exe === "yarn") && parts[1] === "dlx") return npm(after(2));
  if (exe === "cmd" && /^\/c$/i.test(parts[1] || "") && /^npx(\.cmd)?$/i.test(parts[2] || "")) return npm(after(3));  // Windows: cmd /c npx ...
  if (["uvx", "pipx"].includes(exe)) {
    const rest = parts.slice(1)[0] === "run" ? parts.slice(2) : parts.slice(1);
    const p = rest.find(x => !x.startsWith("-"));
    return p && /^[\w.\-\[\]]+([=<>@].*)?$/.test(p) ? "pypi:" + p.split(/[=<>@\[]/)[0].toLowerCase() : null;
  }
  if (exe === "docker" && parts.includes("run")) {
    const img = parts.slice(parts.indexOf("run") + 1).find(x => !x.startsWith("-") && !x.includes("=") && /^[\w.\-/]+(:[\w.\-]+)?$/.test(x) && x.includes("/"));
    return img ? "oci:" + img.replace(/:[\w.\-]+$/, "") : null;
  }
  return null;  // a local script path: nothing public to look up
}

// ---------- collect: what is installed + does it start on this machine
function claudeMcpList() {
  const out = execSync("claude mcp list", { cwd: PROJECT, encoding: "utf8", timeout: 180000, windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
  const rows = [];
  for (const line of out.split(/\r?\n/)) {
    const m = line.match(/^(.+?): (\S.*?) - ([✔✓✗✘×⚠!].*)$/u);
    if (!m) continue;
    const st = m[3], status = /connected/i.test(st) && !/fail|not/i.test(st) ? "ok" : /auth/i.test(st) ? "auth" : "fail";
    rows.push({ name: m[1].trim(), kind: "mcp", id: idOf(m[2].replace(/\s*\((HTTP|SSE|stdio)\)\s*$/i, "")), local: status });
  }
  return rows;
}
function plugins() {
  const d = read(path.join(os.homedir(), ".claude", "plugins", "installed_plugins.json"));
  return Object.keys((d && d.plugins) || {}).map(k => ({ name: k, kind: "plugin", id: "plugin:" + k, local: null }));
}

async function post(p, body) {
  const r = await fetch(API + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  return r.status === 204 ? null : r.json();
}

async function refresh() {
  const prev = read(CACHE) || {};
  write(CACHE, { ...prev, refreshing: Date.now() });
  let tools = [];
  try { tools = claudeMcpList(); } catch { tools = (prev.tools || []).filter(t => t.kind === "mcp"); }
  tools = tools.concat(plugins());
  const ids = [...new Set(tools.map(t => t.id).filter(Boolean))], verdict = {};
  for (let i = 0; i < ids.length; i += 10) {  // server answers max 10 per request
    try { const r = await post("/stack", { tools: ids.slice(i, i + 10), client: CLIENT }); for (const c of (r && r.checked) || []) verdict[c.input] = c; } catch {}
  }
  for (const t of tools) {
    const v = verdict[t.id] || {}, issues = [];
    if (t.local === "fail") issues.push("fails to start on this machine");
    for (const r of v.reasons || []) issues.push(r);
    Object.assign(t, { verdict: t.local === "fail" ? "problem" : v.verdict || "unknown", issues, page: v.page || null, known: !!v.in_kitscout });
  }
  const conf = read(CONF) || {};
  if (conf.share_health) {  // opt-in: anonymous "did it start" counts per public tool id
    const results = tools.filter(t => t.id && t.local).map(t => ({ tool: t.id, status: t.local }));
    if (results.length) await post("/health", { results, client: CLIENT }).catch(() => {});
  }
  write(CACHE, { at: Date.now(), version: VERSION, tools, shown: prev.shown || 0 });
}

const flagged = c => ((c && c.tools) || []).filter(t => t.verdict === "problem" || t.verdict === "avoid" || t.verdict === "caution");
function line(t) { return `- ${t.name} [${t.verdict}]: ${t.issues.join("; ")}${t.page ? " (" + t.page + ")" : ""}`; }

function report(c) {
  if (!c || !c.tools) return "KitScout has not checked your tools yet. It runs in the background at the start of a Claude Code session.";
  const f = flagged(c), when = new Date(c.at).toISOString().slice(0, 16).replace("T", " ") + " UTC";
  return [`KitScout stack check (${when}): ${c.tools.length} tools (${c.tools.filter(t => t.kind === "mcp").length} MCP servers, ${c.tools.filter(t => t.kind === "plugin").length} plugins), ${f.length} need attention.`,
    ...f.map(line),
    ...c.tools.filter(t => !f.includes(t)).map(t => `- ${t.name} [${t.verdict === "unknown" ? (t.known ? "ok" : "not in KitScout") : t.verdict}]`),
    "For alternatives to a flagged tool, use the KitScout check_tools MCP tool with its package id or URL."].join("\n");
}

function hook() {
  // a stable copy for the check-my-stack skill and other agents (plugin cache paths change with every version)
  try { fs.mkdirSync(DIR, { recursive: true }); fs.copyFileSync(fileURLToPath(import.meta.url), path.join(DIR, "guard.mjs")); } catch {}
  const c = read(CACHE), now = Date.now();
  const stale = !c || !c.at || now - c.at > REFRESH_MS, busy = c && c.refreshing && now - c.refreshing < 600e3;
  if (stale && !busy) {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), "--refresh"], { cwd: PROJECT, env: { ...process.env, CLAUDE_PROJECT_DIR: PROJECT }, detached: true, stdio: "ignore", windowsHide: true });
    child.unref();
  }
  const out = {};
  if (c && c.at) {
    const f = flagged(c);
    if (f.length && now - (c.shown || 0) > NAG_MS) {
      out.systemMessage = `KitScout: ${f.length} of your ${c.tools.length} agent tools need attention: ` + f.slice(0, 3).map(t => `${t.name} (${t.issues[0] || t.verdict})`).join(", ") + (f.length > 3 ? ", ..." : "") + ". Ask Claude for the KitScout stack report.";
      write(CACHE, { ...c, shown: now });
    }
    if (f.length) out.hookSpecificOutput = { hookEventName: "SessionStart", additionalContext: "KitScout stack guard found issues with installed agent tools (mention them only if relevant to the user's task or if asked):\n" + f.map(line).join("\n") };
  } else if (!c) {
    out.systemMessage = "KitScout is checking your installed agent tools in the background; you'll see a note here if any of them is failing, abandoned or deprecated.";
  }
  if (Object.keys(out).length) process.stdout.write(JSON.stringify(out));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
const arg = process.argv[2];
if (!isMain) { /* imported (tests) */ }
else if (arg === "--refresh") await refresh().catch(() => {});
else if (arg === "--report") process.stdout.write(report(read(CACHE)) + "\n");
else if (arg === "--share-health") { const v = process.argv[3] !== "off"; write(CONF, { ...(read(CONF) || {}), share_health: v }); process.stdout.write(`KitScout anonymous health sharing: ${v ? "on" : "off"}\n`); }
else { try { hook(); } catch {} }
