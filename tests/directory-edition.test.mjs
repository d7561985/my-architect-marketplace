// covers: FR-097 — the edition submitted to the Anthropic plugin directory stays current with the
// full plugin and holds only what the directory accepts from an organization that is not Verified.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ALLOWED_EXTENSIONS, ALLOWED_FRONTMATTER, SOURCE, TARGET, buildEdition, staleFiles } from '../scripts/build-directory-edition.mjs';

const edition = buildEdition();
const text = rel => edition.get(rel).toString('utf8');
const markdown = [...edition.keys()].filter(rel => rel.endsWith('.md'));

test('the committed edition equals a fresh build of plugins/my-architect', () => {
  assert.deepEqual(staleFiles(edition), [], 'run: node scripts/build-directory-edition.mjs');
});

test('only file types the directory accepts, no scripts, within its size limits', () => {
  assert.ok(edition.size <= 512, `${edition.size} files`);
  for (const [rel, content] of edition) {
    if (rel !== 'LICENSE') assert.ok(ALLOWED_EXTENSIONS.has(path.extname(rel).toLowerCase()), rel);
    assert.notEqual(content.subarray(0, 2).toString('latin1'), '#!', rel);
    assert.ok(content.length < 256 * 1024, `${rel} is ${content.length} bytes`);
    assert.ok(!/(^|\/)(hooks|scripts|tests|evals|node_modules)\//.test(rel), rel);
    assert.ok(!/(^|\/)(CLAUDE|AGENTS|CLAUDE\.local)\.md$/i.test(rel), rel);
    if (!/\.(png|jpe?g|gif|webp)$/i.test(rel)) assert.ok(!content.includes(0), `${rel} has a NUL byte`);
  }
  assert.deepEqual(fs.readdirSync(path.join(TARGET, '.claude-plugin')).sort(), ['icon.png', 'plugin.json']);
});

test('the manifest keeps only the remote OAuth server and no hooks', () => {
  const manifest = JSON.parse(text('.claude-plugin/plugin.json'));
  assert.equal(manifest.name, 'my-architect');
  assert.equal(manifest.hooks, undefined);
  assert.deepEqual(manifest.mcpServers, { 'my-architect': { type: 'http', url: 'https://my-architect.app/mcp' } });
  assert.equal(manifest.privacyPolicyUrl, 'https://my-architect.app/privacy.html');
  const full = JSON.parse(fs.readFileSync(path.join(SOURCE, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal(manifest.version, full.version);
});

test('frontmatter is plain name/description lines', () => {
  for (const rel of markdown) {
    const lines = text(rel).split('\n');
    if (lines[0] !== '---') continue;
    const end = lines.indexOf('---', 1);
    for (const line of lines.slice(1, end)) {
      const key = /^([A-Za-z][\w-]*):/.exec(line)?.[1];
      assert.ok(key && ALLOWED_FRONTMATTER.has(key), `${rel}: ${line.slice(0, 60)}`);
    }
  }
});

test('nothing reads a key from the user machine', () => {
  for (const [rel, content] of edition) {
    const body = content.toString('utf8');
    assert.ok(!/\$\{?MCP_API_KEY|\$\{?[A-Z_]*(TOKEN|API_KEY)\}?|process\.env/.test(body), rel);
  }
});

test('restrictions removed from frontmatter come back as instructions', () => {
  for (const rel of markdown.filter(r => r.startsWith('agents/'))) {
    const source = fs.readFileSync(path.join(SOURCE, rel), 'utf8');
    if (/^tools:/m.test(source)) assert.match(text(rel), /> \*\*Tools\.\*\* Use only these tools: `/, rel);
    if (/^disallowedTools:/m.test(source)) assert.match(text(rel), /> \*\*Never call:\*\* `/, rel);
    if (/^skills:/m.test(source)) assert.match(text(rel), /> \*\*Skills\.\*\* Before you start, load and follow: `myarchitect`/, rel);
  }
  for (const rel of markdown.filter(r => /scripts\/[\w-]+\.mjs/.test(text(r)))) {
    assert.match(text(rel), /This edition has no helper scripts/, rel);
  }
});

test('the README explains the directory edition and connects without a key', () => {
  const readme = text('README.md');
  assert.ok(readme.split(/\s+/).filter(Boolean).length >= 40);
  assert.match(readme, /\*\*Connectors\*\* tab press \*\*Connect\*\*/);
  assert.match(readme, /no hooks and no helper scripts/);
  assert.match(readme, /Install one edition only/);
});
