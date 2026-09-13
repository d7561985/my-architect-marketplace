#!/usr/bin/env node
// Standalone project runtime. Node.js 18+; built-ins only. Architect -> index only.
import { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, dirname, join, isAbsolute } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const configName = '.architect/traceability.json';
const readJSON = path => JSON.parse(readFileSync(path, 'utf8'));
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
function local(path) {
  if (!nonempty(path) || isAbsolute(path)) throw new Error('Paths must be relative to the project root.');
  const target = resolve(root, path);
  if (relative(root, target).split(/[\\/]/).includes('..')) throw new Error('Paths must stay inside the project.');
  return target;
}
function config() {
  const value = readJSON(local(configName));
  for (const field of ['projectId', 'indexPath', 'testCommand', 'coverageCommand', 'syncCommand']) {
    if (!nonempty(value[field])) throw new Error(`Missing traceability config field: ${field}.`);
  }
  if (value.coverageCommand !== 'node .architect/traceability.mjs check') throw new Error('coverageCommand must be the full gate: node .architect/traceability.mjs check. Configure the actual project suite in testCommand.');
  for (const field of ['testPaths', 'ciFiles']) {
    if (!Array.isArray(value[field]) || !value[field].length) throw new Error(`Configure ${field}; an empty scope is not a gate.`);
    value[field].forEach(local);
  }
  local(value.indexPath);
  if (!Array.isArray(value.waived)) throw new Error('waived must be an array of {reason, requirement}.');
  const ids = new Set();
  for (const waiver of value.waived) {
    if (!nonempty(waiver.reason) || !nonempty(waiver.requirement) || waiver.requirement === '*' || ids.has(waiver.requirement)) {
      throw new Error('Every waiver needs a nonempty reason and a unique, explicit requirement ID.');
    }
    ids.add(waiver.requirement);
  }
  return value;
}
function validateIndex(value, cfg) {
  if (value.source !== 'my-architect' || value.projectId !== cfg.projectId) throw new Error('Index/export must identify my-architect and the configured projectId.');
  for (const collection of ['requirements', 'issues']) {
    if (!Array.isArray(value[collection])) throw new Error(`Index/export is missing ${collection}. Export the full project, without filters.`);
    const ids = new Set();
    for (const item of value[collection]) {
      if (!nonempty(item.id) || !nonempty(item.title) || !nonempty(item.status) || ids.has(item.id)) throw new Error(`Invalid or duplicate ${collection} record.`);
      if (collection === 'issues' && (!['open', 'closed'].includes(item.status) || !nonempty(item.description) || !nonempty(item.reported_at) || !Array.isArray(item.closedBy))) throw new Error('Invalid issue export: description, reported_at and closedBy are required.');
      ids.add(item.id);
    }
  }
  if (!value.requirements.length) throw new Error('The requirement index is empty; an empty scope is not a green gate.');
  return value;
}
function index(cfg) { return validateIndex(readJSON(local(cfg.indexPath)), cfg); }
async function sync(cfg, args) {
  let incoming;
  if (args.length) {
    if (args[0] !== '--snapshot' || args.length !== 2) throw new Error('Usage: sync [--snapshot <Architect-export.json>].');
    incoming = readJSON(local(args[1]));
  } else {
    if (!nonempty(process.env.MA_API_URL)) throw new Error('Set MA_API_URL from the configured Architect MCP connection, or use --snapshot <Architect-export.json>.');
    const base = new URL(process.env.MA_API_URL);
    if (base.username || base.password || base.search || base.hash) throw new Error('MA_API_URL must not contain credentials, query parameters or fragments.');
    if (!['http:', 'https:'].includes(base.protocol)) throw new Error('MA_API_URL must use HTTP or HTTPS.');
    const headers = process.env.MCP_API_KEY ? { Authorization: `Bearer ${process.env.MCP_API_KEY}` } : {};
    const fetchCollection = async name => {
      const response = await fetch(`${base.href.replace(/\/$/, '')}/api/projects/${encodeURIComponent(cfg.projectId)}/${name}`, { headers, redirect: 'error', signal: AbortSignal.timeout(15000) });
      // Do not echo response bodies or URLs: they may contain confidential data.
      if (!response.ok) throw new Error(`Architect ${name} export failed: HTTP ${response.status}.`);
      return response.json();
    };
    const [requirements, issues] = await Promise.all([fetchCollection('requirements'), fetchCollection('issues')]);
    incoming = { source: 'my-architect', projectId: cfg.projectId, requirements, issues };
  }
  validateIndex(incoming, cfg);
  if (existsSync(local(cfg.indexPath))) {
    const previous = index(cfg);
    const nextIds = new Set(incoming.requirements.map(item => item.id));
    const removed = previous.requirements.filter(item => !nextIds.has(item.id));
    const unwaived = removed.filter(item => !cfg.waived.some(waiver => waiver.requirement === item.id));
    if (unwaived.length) throw new Error(`Refusing scope shrink: missing requirement IDs ${unwaived.map(item => item.id).join(', ')}. Restore the full export or record an explicit {reason, requirement} waiver; waived records remain in the index.`);
    for (const item of removed) incoming.requirements.push({ ...item, waived: cfg.waived.find(waiver => waiver.requirement === item.id) });
  }
  const output = { source: 'my-architect', projectId: cfg.projectId, syncedAt: new Date().toISOString(), requirements: incoming.requirements, issues: incoming.issues };
  const destination = local(cfg.indexPath);
  mkdirSync(dirname(destination), { recursive: true });
  const temporary = `${destination}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(output, null, 2) + '\n');
  renameSync(temporary, destination);
  console.log(`Synced ${output.requirements.length} requirements and ${output.issues.length} issues from Architect.`);
}
function testFiles(cfg) {
  const files = new Set();
  const pattern = new RegExp(cfg.testFilePattern || '(?:^|/)[^/]+\\.(?:test|spec)\\.[cm]?[jt]sx?$');
  function visit(path, explicit = false) {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) throw new Error(`Test scope contains a symlink: ${relative(root, path)}.`);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) {
        if (['node_modules', '.git', '.architect'].includes(entry)) continue;
        visit(join(path, entry));
      }
    } else if (stat.isFile() && (explicit || pattern.test(relative(root, path).replaceAll('\\', '/')))) files.add(path);
  }
  for (const path of cfg.testPaths) visit(local(path), true);
  return [...files];
}
function coverage(cfg) {
  const data = index(cfg);
  const files = testFiles(cfg);
  if (!files.length) throw new Error('No permanent test files in configured testPaths.');
  const required = new Set(data.requirements.map(item => item.id));
  const covered = new Set();
  const annotation = new RegExp(cfg.coversPattern || '\\bcovers:\\s*([^\\r\\n]+)', 'g');
  for (const file of files) {
    for (const match of readFileSync(file, 'utf8').matchAll(annotation)) {
      if (match[1] === undefined) throw new Error('coversPattern must capture requirement IDs in group 1.');
      for (const id of match[1].replace(/\*\/.*$/, '').trim().split(/[\s,]+/).filter(Boolean)) {
        if (!required.has(id)) throw new Error(`Unknown covered requirement ${id} in ${relative(root, file)}. Sync or fix the annotation.`);
        covered.add(id);
      }
    }
  }
  for (const waiver of cfg.waived) {
    if (!required.has(waiver.requirement)) throw new Error(`Waiver references unknown requirement ${waiver.requirement}.`);
    console.log(`WAIVED ${waiver.requirement}: ${waiver.reason}`);
    covered.add(waiver.requirement);
  }
  const missing = [...required].filter(id => !covered.has(id));
  if (missing.length) throw new Error(`Uncovered requirements: ${missing.join(', ')}. Add permanent tests declaring covers: <id>, or an explicit {reason, requirement} waiver.`);
  console.log(`Coverage: ${required.size} requirements accounted for across ${files.length} permanent test files.`);
}
function activeCIGate(cfg) {
  // Conservative YAML subset: a dedicated, unconditional run/script command.
  // Unsupported indirection is a gap to inspect, never an assumed green result.
  return cfg.ciFiles.some(file => {
    if (!existsSync(local(file))) return false;
    const lines = readFileSync(local(file), 'utf8').split(/\r?\n/).filter(line => !/^\s*#/.test(line)).map(line => line.replace(/\s+#.*$/, ''));
    if (file.replaceAll('\\', '/').startsWith('.github/workflows/')) {
      const trigger = lines.findIndex(line => /^(?:on|'on'|"on")\s*:/.test(line));
      if (trigger < 0) return false;
      const inline = lines[trigger].replace(/^(?:on|'on'|"on")\s*:\s*/, '');
      if (inline.trim()) {
        if (!/\b(?:push|pull_request|merge_group)\b/.test(inline)) return false;
      } else {
        let automatic = false;
        for (let offset = trigger + 1; offset < lines.length && (!lines[offset].trim() || /^\s/.test(lines[offset])); offset++) {
          if (/^\s+(?:push|pull_request|merge_group)\s*:/.test(lines[offset])) automatic = true;
        }
        if (!automatic) return false;
      }
    }
    const content = lines.join('\n');
    if (/\b(?:continue-on-error|allow_failure)\s*:\s*(?:true|\$\{\{)/.test(content) || /^\s*(?:-\s*)?if\s*:/m.test(content) || /\bwhen\s*:\s*(?:never|manual)/.test(content)) return false;
    const exact = line => line.trim().replace(/^(['"])(.*)\1$/, '$2') === cfg.coverageCommand.trim();
    for (let offset = 0; offset < lines.length; offset++) {
      const line = lines[offset];
      const field = line.match(/^\s*(?:-\s*)?(?:run|script)\s*:\s*(.*?)\s*$/);
      if (field) {
        if (exact(field[1])) return true;
        if (/^(?:[|>][-+]?|)$/.test(field[1])) {
          const keyIndent = line.search(/\S/) + (/^\s*-\s/.test(line) ? 2 : 0);
          const body = [];
          for (let next = offset + 1; next < lines.length; next++) {
            if (!lines[next].trim()) continue;
            if (lines[next].search(/\S/) <= keyIndent) break;
            body.push(lines[next].trim().replace(/^-\s*/, ''));
          }
          if (body.length === 1 && exact(body[0])) return true;
        }
      }
    }
    return false;
  });
}
function health() {
  const gaps = [];
  try {
    const cfg = config();
    if (!existsSync(local('.architect/traceability.mjs'))) gaps.push('Missing sync/coverage runtime.');
    try {
      const data = index(cfg);
      if (!nonempty(data.syncedAt)) gaps.push('No recorded Architect synchronization.');
      if (!data.issues.length && data.requirements.some(item => item.status === 'done')) gaps.push('No issues in the exported registry while done requirements exist. Inspect the real issue registry; do not invent issues.');
    } catch (error) { gaps.push(`Repository index/sync gap: ${error.message}`); }
    if (!activeCIGate(cfg)) gaps.push('CI gap: place the full test + coverage gate in a dedicated, unconditional run/script step with automatic CI triggers. Complex/conditional shell wiring cannot be verified by this hook.');
  } catch (error) { gaps.push(`Missing or invalid traceability setup: ${error.message}`); }
  if (!gaps.length) return;
  const context = `<architect-health>\n${gaps.join('\n')}\nRepair action: /my-architect:init. Reuse a confirmed project link from local instructions/config or the user's existing choice. Otherwise choose the correct existing Architect project, or create a project when already authorized; ask only if the choice or creation authorization is unresolved. Save the confirmed local project binding, then complete sync, permanent tests and the CI gate. Missing local traceability config does not establish whether an Architect project exists. This hook reports facts only and performs no repairs.\n</architect-health>`;
  if (process.env.CURSOR_PLUGIN_ROOT) console.log(JSON.stringify({ additional_context: context }));
  else if (process.env.CLAUDE_PLUGIN_ROOT && !process.env.COPILOT_CLI) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }));
  else console.log(JSON.stringify({ additionalContext: context }));
}

try {
  const [action, ...args] = process.argv.slice(2);
  if (action === 'health') health();
  else {
    const cfg = config();
    if (action === 'sync') await sync(cfg, args);
    else if (action === 'coverage') coverage(cfg);
    else if (action === 'check') {
      const result = spawnSync(cfg.testCommand, { shell: true, cwd: root, stdio: 'inherit' });
      if (result.status !== 0 || result.error) throw new Error('The configured project test command failed.');
      coverage(cfg);
    } else throw new Error('Usage: traceability.mjs sync [--snapshot <file>] | coverage | check | health');
  }
} catch (error) {
  console.error(`Architect traceability: ${error.message}`);
  process.exitCode = 1;
}
