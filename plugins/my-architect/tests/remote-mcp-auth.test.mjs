// covers: FR-096 FR-097 — the plugin connects to the remote MCP server with OAuth and meets the directory's checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const plugin = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(join(plugin, '.claude-plugin/plugin.json'), 'utf8'));
const readme = readFileSync(join(plugin, '../../README.md'), 'utf8');
const pluginReadme = readFileSync(join(plugin, 'README.md'), 'utf8');

test('the server is the remote HTTP endpoint under the same name, without env, npx or headers', () => {
  const server = manifest.mcpServers['my-architect'];
  assert.deepEqual(server, { type: 'http', url: 'https://my-architect.app/mcp' });
});

// Measured with Claude Code 2.1.323 on 24.11.2026: any headers or headersHelper on an HTTP
// server stops Claude Code from using OAuth, even after a successful sign-in.
test('nothing in the definition disables the OAuth sign-in', () => {
  const server = manifest.mcpServers['my-architect'];
  assert.equal(server.headers, undefined);
  assert.equal(server.headersHelper, undefined);
});

// Directory rule: a remote server URL must be a literal https:// URL; Claude chat and Cowork
// do not expand ${VAR} forms either.
test('the MCP URL is a literal https URL', () => {
  for (const server of Object.values(manifest.mcpServers)) {
    assert.match(server.url, /^https:\/\/[^$\s]+$/);
  }
});

test('the plugin folder carries what the directory asks for', () => {
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.privacyPolicyUrl, 'https://my-architect.app/privacy.html');
  const prose = pluginReadme.replace(/```[\s\S]*?```/g, ' ');
  assert.ok(prose.split(/\s+/).filter(Boolean).length >= 40, 'README in the plugin folder needs at least 40 words outside code blocks');
  const icon = readFileSync(join(plugin, '.claude-plugin/icon.png'));
  assert.equal(icon.subarray(1, 4).toString('latin1'), 'PNG');
  const width = icon.readUInt32BE(16), height = icon.readUInt32BE(20);
  assert.equal(width, height, 'icon must be square');
  assert.ok(width >= 512 && width <= 2048, `icon is ${width}px`);
  assert.ok(statSync(join(plugin, '.claude-plugin/icon.png')).size < 2 * 1024 * 1024);
});

test('the READMEs explain installing in Claude apps first and keep a key path for headless use', () => {
  assert.match(pluginReadme, /Customize → Plugins → Add → Add marketplace/);
  assert.match(pluginReadme, /\*\*Connectors\*\* tab press \*\*Connect\*\*/);
  assert.match(readme, /\/mcp`, choose `my-architect` and \*\*Authenticate\*\*/);
  assert.match(readme, /--header "Authorization: Bearer \$MCP_API_KEY"/);
});
