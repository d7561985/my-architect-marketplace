// Builds directory/my-architect: the edition submitted to the Anthropic plugin directory.
// The directory accepts hooks, scripts and some frontmatter keys only from Verified
// organizations, so this edition carries the skills, agents, commands and the remote MCP
// server of plugins/my-architect without them. The full plugin stays the source of truth.
//
//   node scripts/build-directory-edition.mjs          write the edition
//   node scripts/build-directory-edition.mjs --check  exit 1 if the committed edition is stale
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SOURCE = path.join(ROOT, 'plugins/my-architect');
export const TARGET = path.join(ROOT, 'directory/my-architect');
const README = path.join(ROOT, 'scripts/directory-edition/README.md');

/** Frontmatter keys this edition keeps; everything else is rewritten into the body or dropped. */
export const ALLOWED_FRONTMATTER = new Set(['name', 'description']);
/** File types the directory accepts from organizations that are not Verified. */
export const ALLOWED_EXTENSIONS = new Set(['.md', '.txt', '.json', '.yaml', '.yml', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico']);
/** Folders that exist only for the full plugin: hooks and scripts it runs, tests and evals for maintainers. */
const SKIPPED_DIRS = new Set(['hooks', 'scripts', 'tests', 'evals']);

export const FULL_EDITION = 'the full edition from the `d7561985/my-architect-marketplace` marketplace';
const SCRIPT_NOTE = `> **Directory edition.** This edition has no helper scripts. A step below that runs \`scripts/*.mjs\` needs ${FULL_EDITION} in Claude Code. Without it, tell the user which step was skipped and why; do not imitate the script by hand.`;
const HOOK_NOTE = `> **Directory edition.** This edition has no hooks, so nothing checks \`.architect\` at session start. Run the checks this page describes yourself when the work needs them.`;

/** Splits `---` frontmatter into top-level entries, each with its continuation lines. */
function splitFrontmatter(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') return { entries: [], body: text };
  const end = lines.indexOf('---', 1);
  if (end < 0) throw new Error('unterminated frontmatter');
  const entries = [];
  for (const line of lines.slice(1, end)) {
    const top = /^([A-Za-z][\w-]*):(.*)$/.exec(line);
    if (top) entries.push({ key: top[1], first: top[2].trim(), lines: [line] });
    else if (entries.length) entries[entries.length - 1].lines.push(line);
    else throw new Error(`frontmatter line before any key: ${line}`);
  }
  return { entries, body: lines.slice(end + 1).join('\n') };
}

/** Values of a YAML block list (`key:` followed by `  - item` lines) or an inline value. */
function listValues(entry) {
  const items = entry.lines.slice(1).map(l => /^\s*-\s*(.+)$/.exec(l)?.[1]?.trim()).filter(Boolean);
  if (items.length) return items;
  return entry.first ? entry.first.replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean) : [];
}

const shortTool = name => name.replace(/^mcp__plugin_my-architect_my-architect__/, '');

/** Turns frontmatter the directory refuses into instructions with the same effect. */
function transformMarkdown(rel, text) {
  const { entries, body } = splitFrontmatter(text);
  const kept = [];
  const notes = [];
  for (const entry of entries) {
    if (ALLOWED_FRONTMATTER.has(entry.key)) { kept.push(...entry.lines); continue; }
    if (entry.key === 'tools') {
      notes.push(`> **Tools.** Use only these tools: ${listValues(entry).map(t => `\`${shortTool(t)}\``).join(', ')}. Do not call any other tool, even when it is available.`);
    } else if (entry.key === 'disallowedTools') {
      notes.push(`> **Never call:** ${listValues(entry).map(t => `\`${shortTool(t)}\``).join(', ')}.`);
    } else if (entry.key === 'skills') {
      notes.push(`> **Skills.** Before you start, load and follow: ${listValues(entry).map(s => `\`${s}\``).join(', ')}.`);
    }
    // model: inherit and argument-hint only tune the host's defaults and menus; dropping them keeps behaviour.
  }
  if (/scripts\/[\w-]+\.mjs|CLAUDE_PLUGIN_ROOT\}?\/scripts/.test(body)) notes.push(SCRIPT_NOTE);
  if (/architect-health|code-graph-context|SessionStart hook/.test(body)) notes.push(HOOK_NOTE);
  const head = entries.length ? ['---', ...kept, '---'].join('\n') + '\n' : '';
  if (!notes.length) return head + body;
  const lead = body.startsWith('\n') ? '' : '\n';
  return `${head}${lead}${notes.join('\n\n')}\n${body.startsWith('\n') ? body : `\n${body}`}`;
}

function walk(dir, rel = '') {
  const out = [];
  for (const entry of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const child = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!SKIPPED_DIRS.has(entry.name)) out.push(...walk(dir, child));
    } else {
      out.push(child);
    }
  }
  return out;
}

/** The edition as a sorted map of relative path → file contents (Buffer). */
export function buildEdition() {
  const files = new Map();
  for (const rel of walk(SOURCE).sort()) {
    if (rel === 'README.md') continue;
    const ext = path.extname(rel).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;
    const source = fs.readFileSync(path.join(SOURCE, rel));
    if (source.subarray(0, 2).toString('latin1') === '#!') continue;
    if (ext === '.md') files.set(rel, Buffer.from(transformMarkdown(rel, source.toString('utf8'))));
    else if (rel === '.claude-plugin/plugin.json') {
      const manifest = JSON.parse(source.toString('utf8'));
      delete manifest.hooks;
      files.set(rel, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
    } else files.set(rel, source);
  }
  files.set('README.md', fs.readFileSync(README));
  files.set('LICENSE', fs.readFileSync(path.join(ROOT, 'LICENSE')));
  return new Map([...files].sort(([a], [b]) => a.localeCompare(b)));
}

/** Paths whose committed copy differs from a fresh build, plus stray files. */
export function staleFiles(edition = buildEdition()) {
  const stale = [];
  const onDisk = fs.existsSync(TARGET) ? walk(TARGET) : [];
  for (const rel of onDisk) if (!edition.has(rel)) stale.push(`extra: ${rel}`);
  for (const [rel, content] of edition) {
    const file = path.join(TARGET, rel);
    if (!fs.existsSync(file) || !fs.readFileSync(file).equals(content)) stale.push(`changed: ${rel}`);
  }
  return stale;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const edition = buildEdition();
  if (process.argv.includes('--check')) {
    const stale = staleFiles(edition);
    if (stale.length) {
      console.error(`directory/my-architect is stale; run node scripts/build-directory-edition.mjs\n${stale.join('\n')}`);
      process.exit(1);
    }
    console.log(`directory/my-architect is current (${edition.size} files)`);
  } else {
    fs.rmSync(TARGET, { recursive: true, force: true });
    for (const [rel, content] of edition) {
      fs.mkdirSync(path.dirname(path.join(TARGET, rel)), { recursive: true });
      fs.writeFileSync(path.join(TARGET, rel), content);
    }
    console.log(`wrote ${edition.size} files to directory/my-architect`);
  }
}
