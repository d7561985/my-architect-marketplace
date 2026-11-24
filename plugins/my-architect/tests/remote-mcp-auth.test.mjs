// covers: FR-096 — the plugin connects to the remote MCP server and signs in with OAuth, without an API key in env.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const plugin = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(join(plugin, '.claude-plugin/plugin.json'), 'utf8'));
const readme = readFileSync(join(plugin, '../../README.md'), 'utf8');

test('the server is the remote HTTP endpoint under the same name, without env, npx or headers', () => {
  const server = manifest.mcpServers['my-architect'];
  assert.deepEqual(server, { type: 'http', url: '${MY_ARCHITECT_MCP_URL:-https://my-architect.app/mcp}' });
});

// Measured with Claude Code 2.1.323 on 24.11.2026: any headers or headersHelper on an HTTP
// server stops Claude Code from using OAuth, even after a successful sign-in.
test('nothing in the definition disables the OAuth sign-in', () => {
  const server = manifest.mcpServers['my-architect'];
  assert.equal(server.headers, undefined);
  assert.equal(server.headersHelper, undefined);
});

test('the README explains the sign-in and keeps a documented key path for headless use', () => {
  assert.match(readme, /\/mcp`, choose `my-architect` and \*\*Authenticate\*\*/);
  assert.match(readme, /--header "Authorization: Bearer \$MCP_API_KEY"/);
});
