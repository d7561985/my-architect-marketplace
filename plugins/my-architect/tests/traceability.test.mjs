import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';

const plugin = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const installer = join(plugin, 'scripts/init-traceability.mjs');
const hook = join(plugin, 'hooks/architect-health.sh');
const req = (id, status = 'approved') => ({ id, type: 'FR', title: id, description: 'Example requirement', status, ownerNodeId: 'feature-1', tracesTo: [], closes: [] });
const issue = { id: 'issue-1', title: 'Example problem', description: 'A maintainer cannot complete the operation.', status: 'open', source: '', reported_at: '2026-09-12T00:00:00Z', closedBy: [] };

function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'architect-trace-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function put(root, path, data) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), typeof data === 'string' ? data : JSON.stringify(data, null, 2));
}
function run(root, args, env = {}) {
  return spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });
}
function init(root) {
  const result = run(root, [installer, '--project-id', 'example project', '--test-command', 'node --test tests/*.test.mjs', '--test-path', 'tests', '--ci-file', '.github/workflows/test.yml']);
  assert.equal(result.status, 0, result.stderr);
  return result;
}
function command(root, ...args) { return run(root, ['.architect/traceability.mjs', ...args]); }
function snapshot(root, requirements = [req('FR-1')], issues = [issue]) {
  put(root, 'export.json', { source: 'my-architect', projectId: 'example project', requirements, issues });
  return command(root, 'sync', '--snapshot', 'export.json');
}
function config(root, change) {
  const value = JSON.parse(readFileSync(join(root, '.architect/traceability.json'), 'utf8'));
  put(root, '.architect/traceability.json', { ...value, ...change });
}
function ci(root, line = 'node .architect/traceability.mjs check') {
  put(root, '.github/workflows/test.yml', `name: Tests\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: ${line}\n`);
}
function testFile(root, covers = '// covers: FR-1') {
  put(root, 'tests/example.test.mjs', `import { test } from 'node:test';\n${covers}\ntest('operation works', () => {});\n`);
}
function health(root) {
  return spawnSync('bash', [hook], { cwd: root, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: root, CLAUDE_PLUGIN_ROOT: plugin } });
}

// Each mutation below breaks a user-visible invariant, not a source-text assertion.
test('init installs executable sync/gate and preserves existing project instructions on rerun', (t) => {
  const root = project(t);
  put(root, 'CLAUDE.md', '# Existing instructions\n');
  init(root);
  const before = readFileSync(join(root, 'CLAUDE.md'), 'utf8');
  init(root);
  assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), before);
  assert.match(before, /Existing instructions/);
  assert.match(before, /my-architect:traceability/);
  assert.match(before, /my_architect pid: "example project"/);
  assert.equal(snapshot(root).status, 0);
  testFile(root);
  assert.equal(command(root, 'check').status, 0);
});

test('removing covers makes the gate red; explicit scoped waiver is required', (t) => {
  const root = project(t); init(root); snapshot(root); testFile(root);
  assert.equal(command(root, 'coverage').status, 0);
  testFile(root, '// annotation removed deliberately');
  assert.notEqual(command(root, 'coverage').status, 0);
  config(root, { waived: [{ requirement: 'FR-1', reason: '' }] });
  assert.notEqual(command(root, 'coverage').status, 0);
  config(root, { waived: [{ requirement: 'FR-1', reason: 'Manual hardware check; tracked exception.' }] });
  const result = command(root, 'coverage');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /WAIVED.*FR-1/);
});

test('gate runs the configured tests and propagates their failure', (t) => {
  const root = project(t); init(root); snapshot(root); testFile(root);
  config(root, { testCommand: 'node -e "process.exit(7)"' });
  assert.notEqual(command(root, 'check').status, 0);
});

test('project-specific test paths and annotation conventions work without widening the scope', (t) => {
  const root = project(t); init(root); snapshot(root);
  put(root, 'checks/download.mjs', '// requirement: FR-1\n');
  config(root, { testPaths: ['checks/download.mjs'], coversPattern: 'requirement: ([A-Z]+-[0-9]+)' });
  assert.equal(command(root, 'coverage').status, 0);
  put(root, 'checks/download.mjs', '// requirement removed\n');
  put(root, 'docs/example.md', '// requirement: FR-1\n');
  assert.notEqual(command(root, 'coverage').status, 0);
});

test('sync refuses lost IDs including an equal-size replacement, retaining the old index', (t) => {
  const root = project(t); init(root);
  assert.equal(snapshot(root, [req('FR-1'), req('FR-2')]).status, 0);
  const before = readFileSync(join(root, '.architect/requirements-index.json'), 'utf8');
  for (const requirements of [[req('FR-1')], [req('FR-1'), req('FR-3')]]) {
    const result = snapshot(root, requirements);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /FR-2/);
    assert.equal(readFileSync(join(root, '.architect/requirements-index.json'), 'utf8'), before);
  }
});

test('waived removed requirement remains in the index with the explicit reason', (t) => {
  const root = project(t); init(root); snapshot(root, [req('FR-1'), req('FR-2')]);
  config(root, { waived: [{ requirement: 'FR-2', reason: 'Retired upstream; owner accepted scope change.' }] });
  assert.equal(snapshot(root, [req('FR-1')]).status, 0);
  const index = JSON.parse(readFileSync(join(root, '.architect/requirements-index.json'), 'utf8'));
  assert.deepEqual(index.requirements.map(r => r.id), ['FR-1', 'FR-2']);
  assert.match(index.requirements[1].waived.reason, /Retired upstream/);
});

test('missing, empty, malformed and wrong-project exports cannot create a green gate', (t) => {
  const root = project(t); init(root); testFile(root);
  assert.notEqual(command(root, 'coverage').status, 0);
  assert.notEqual(snapshot(root, []).status, 0);
  put(root, 'export.json', { source: 'my-architect', projectId: 'another-project', requirements: [req('FR-1')], issues: [] });
  assert.notEqual(command(root, 'sync', '--snapshot', 'export.json').status, 0);
  assert.equal(existsSync(join(root, '.architect/requirements-index.json')), false);
  put(root, 'export.json', { source: 'my-architect', projectId: 'example project', requirements: [req('FR-1')] });
  assert.notEqual(command(root, 'sync', '--snapshot', 'export.json').status, 0);
});

test('healthy hook is silent; removing or disabling the CI gate emits init guidance without repair', (t) => {
  const root = project(t); init(root); snapshot(root); testFile(root); ci(root);
  assert.equal(health(root).stdout, '');
  for (const line of ['echo done', '# node .architect/traceability.mjs check', 'echo node .architect/traceability.mjs check', 'node .architect/traceability.mjs check || true']) {
    ci(root, line);
    const before = readFileSync(join(root, '.github/workflows/test.yml'), 'utf8');
    const result = health(root);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /CI/);
    assert.match(result.stdout, /my-architect:init/);
    assert.equal(readFileSync(join(root, '.github/workflows/test.yml'), 'utf8'), before);
  }
  ci(root);
  const workflow = readFileSync(join(root, '.github/workflows/test.yml'), 'utf8');
  for (const extra of ['        if: false\n', '        continue-on-error: true\n']) {
    put(root, '.github/workflows/test.yml', workflow + extra);
    assert.match(health(root).stdout, /CI/);
  }
  ci(root);
  assert.equal(health(root).stdout, '');
});

test('multiline CI gate is recognized only as an unconditional failure-propagating command', (t) => {
  const root = project(t); init(root); snapshot(root); testFile(root);
  ci(root, '|\n          node .architect/traceability.mjs check');
  assert.equal(health(root).stdout, '');
  for (const body of [
    'if false; then\n          node .architect/traceability.mjs check\n          fi',
    'set +e\n          node .architect/traceability.mjs check\n          exit 0',
    'exit 0\n          node .architect/traceability.mjs check',
  ]) {
    ci(root, `|\n          ${body}`);
    assert.match(health(root).stdout, /CI/);
  }
});

test('init refuses changing project identity and preserves customized runtime/config', (t) => {
  const root = project(t); init(root);
  const before = readFileSync(join(root, '.architect/traceability.json'), 'utf8');
  const result = run(root, [installer, '--project-id', 'wrong project', '--test-command', 'anything', '--test-path', 'other', '--ci-file', 'ci.yml']);
  assert.notEqual(result.status, 0);
  assert.equal(readFileSync(join(root, '.architect/traceability.json'), 'utf8'), before);
  put(root, '.architect/traceability.mjs', '// project customization\n');
  init(root);
  assert.equal(readFileSync(join(root, '.architect/traceability.mjs'), 'utf8'), '// project customization\n');
});

test('init validates project paths before writing files', (t) => {
  const root = project(t);
  for (const [flag, value] of [['--test-path', '../outside'], ['--index-path', '/tmp/outside-index.json'], ['--ci-file', '../outside.yml']]) {
    const result = run(root, [installer, '--project-id', 'example project', '--test-command', 'node --test', '--test-path', 'tests', '--ci-file', 'ci.yml', flag, value]);
    assert.notEqual(result.status, 0);
    assert.equal(existsSync(join(root, '.architect')), false);
  }
});

test('replacing the full coverage gate with a successful no-op cannot make health green', (t) => {
  const root = project(t); init(root); snapshot(root); testFile(root);
  config(root, { coverageCommand: 'true' }); ci(root, 'true');
  assert.match(health(root).stdout, /gate|coverage/i);
});

test('a manual-only GitHub workflow cannot stand in for an automatic CI gate', (t) => {
  const root = project(t); init(root); snapshot(root); testFile(root); ci(root);
  const path = '.github/workflows/test.yml';
  const workflow = readFileSync(join(root, path), 'utf8');
  for (const trigger of ['on: workflow_dispatch', 'on: workflow_dispatch # push']) {
    put(root, path, workflow.replace('on: [push, pull_request]', trigger));
    assert.match(health(root).stdout, /CI/);
  }
  put(root, path, workflow.replace('on: [push, pull_request]', 'on:\n  pull_request:\n  push:'));
  assert.equal(health(root).stdout, '');
});

test('HTTP sync requires an explicit endpoint instead of guessing a deployment', (t) => {
  const root = project(t); init(root);
  const result = run(root, ['.architect/traceability.mjs', 'sync'], { MA_API_URL: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /MA_API_URL/);
  assert.equal(existsSync(join(root, '.architect/requirements-index.json')), false);
});

test('non-Architect projects are silent; existing MCP or CLAUDE markers report missing setup', (t) => {
  const root = project(t);
  const clean = health(root);
  assert.equal(clean.status, 0); assert.equal(clean.stdout, ''); assert.equal(clean.stderr, '');
  put(root, '.mcp.json', { mcpServers: { my_architect: { command: 'example' } } });
  assert.match(health(root).stdout, /my-architect:init/);
  rmSync(join(root, '.mcp.json'));
  put(root, 'CLAUDE.md', 'Use my-architect get_project_context({pid: "example project"}).\n');
  assert.match(health(root).stdout, /my-architect:init/);
});

for (const [name, instructions, mentionOnly] of [
  ['work tracking', 'Use my_architect to track project work.\n', 'my_architect\n'],
  ['MCP project', '**my_architect MCP** project `example-project` — keep requirements current.\n', '**my_architect**\n'],
  ['canonical source', '**Canonical source:** `my-architect` MCP server, project **`example-project`**.\n', '`my-architect`\n'],
  ['numbered declaration', '2. **my_architect MCP** project `example-project` — keep requirements current.\n', '2. **my_architect**\n'],
  ['legacy binding', 'my_architect pid: "example project"\n', 'my_architect\n'],
  ['compact legacy binding', 'my_architect pid:"example project"\n', 'my_architect\n'],
  ['legacy binding with colon whitespace', 'my-architect pid \t:\t"example project"\n', 'my-architect\n'],
  ['canonical setup marker', '<!-- my-architect:traceability .architect/traceability.json -->\n', 'my-architect\n'],
  ['MCP call instruction', 'Use my-architect get_project_context({pid: "example project"}).\n', 'my-architect\n'],
  ['declaration after a fenced comment example', '```html\n<!--\n```\nUse my_architect to track project work.\n', 'my_architect\n'],
  ['declaration after indented code', '    ```markdown\n    example\n\nUse my_architect to track project work.\n', 'my_architect\n'],
  ['heading ends a blockquote', '> Historical note\n## Tracker\nUse my_architect to track project work.\n', 'my_architect\n'],
  ['list ends a blockquote', '> Historical note\n2. **my_architect MCP** project `example-project` — keep requirements current.\n', 'my_architect\n'],
]) {
  // Broadening detection to any brand mention must fail the second invocation.
  test(`Architect declaration reports missing setup and removing usage leaves silence: ${name}`, (t) => {
    const root = project(t);
    put(root, 'CLAUDE.md', instructions);
    const result = health(root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Missing or invalid traceability setup/);
    assert.match(result.stdout, /my-architect:init/);
    assert.equal(result.stderr, '');
    assert.equal(existsSync(join(root, '.architect')), false);
    assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), instructions);
    put(root, 'CLAUDE.md', mentionOnly);
    const unrelated = health(root);
    assert.equal(unrelated.status, 0, unrelated.stderr);
    assert.equal(unrelated.stdout, '');
    assert.equal(unrelated.stderr, '');
    assert.equal(existsSync(join(root, '.architect')), false);
    assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), mentionOnly);
  });
}

for (const [name, instructions] of [
  ['comparison prose', 'This document compares my_architect with another tracker.\n'],
  ['product repository reference', 'The product source lives in a separate repository (`my_architect`).\n'],
  ['explicit non-use', 'We do not use my_architect in this project.\n'],
  ['quoted example', '"Use my_architect to track project work."\n'],
  ['inline code example', '`Use my_architect to track project work.`\n'],
  ['blockquote example', '> Use my_architect to track project work.\n'],
  ['blockquote continuation', '> Example instruction:\nUse my_architect to track project work.\n'],
  ['backtick fence example', '```markdown\nUse my_architect to track project work.\n```\n'],
  ['fence example inside a list', '- ```markdown\n  Use my_architect to track project work.\n  ```\n'],
  ['tilde fence example', '~~~markdown\nmy_architect pid: "example project"\n~~~\n'],
  ['shorter fence is not a closing fence', '````markdown\n```\nUse my_architect to track project work.\n````\n'],
  ['indented code example', '    Use my_architect to track project work.\n'],
  ['commented example', '<!--\nUse my_architect to track project work.\n-->\n'],
  ['fenced setup marker example', '```markdown\n<!-- my-architect:traceability .architect/traceability.json -->\n```\n'],
]) {
  // A comparison, quotation or example is not a local project declaration.
  test(`Architect mention without an active declaration stays silent: ${name}`, (t) => {
    const root = project(t);
    put(root, 'CLAUDE.md', instructions);
    const result = health(root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
    assert.equal(existsSync(join(root, '.architect')), false);
    assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), instructions);
  });
}

test('missing setup guidance explains project binding before synchronization and never creates it', (t) => {
  const root = project(t);
  put(root, 'CLAUDE.md', 'Use my_architect to track project work.\n');
  const result = health(root);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\/my-architect:init/);
  assert.match(result.stdout, /reuse.*confirmed.*(?:link|binding)/i);
  assert.match(result.stdout, /choose.*existing.*project/i);
  assert.match(result.stdout, /create.*project/i);
  assert.match(result.stdout, /already authorized|existing authorization/i);
  assert.match(result.stdout, /save.*local.*binding/i);
  assert.match(result.stdout, /sync.*tests.*CI/i);
  assert.equal(existsSync(join(root, '.architect')), false);
});

test('nested invocation finds uninitialized Architect usage at the Git root', (t) => {
  const root = project(t);
  const git = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8' });
  assert.equal(git.status, 0, git.stderr);
  put(root, 'CLAUDE.md', 'Use my_architect to track project work.\n');
  const nested = join(root, 'packages', 'example');
  mkdirSync(nested, { recursive: true });
  const result = health(nested);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /my-architect:init/);
  assert.equal(existsSync(join(root, '.architect')), false);
  assert.equal(existsSync(join(nested, '.architect')), false);
});

test('done requirements and no issues emit a factual registry gap; approved alone does not', (t) => {
  const root = project(t); init(root); testFile(root); ci(root);
  snapshot(root, [req('FR-1')], []);
  assert.equal(health(root).stdout, '');
  snapshot(root, [req('FR-1', 'done')], []);
  assert.match(health(root).stdout, /issue/i);
});

test('HTTP sync reads both collections with encoded pid and env authentication only', async (t) => {
  const root = project(t); init(root);
  const requests = [];
  const server = createServer((request, response) => {
    requests.push({ url: request.url, method: request.method, auth: request.headers.authorization });
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(request.url.endsWith('/requirements') ? [req('FR-1')] : [issue]));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, ['.architect/traceability.mjs', 'sync'], { cwd: root, env: { ...process.env, MA_API_URL: `http://127.0.0.1:${server.address().port}`, MCP_API_KEY: 'test-secret-value' } });
    let stderr = ''; child.stderr.on('data', data => { stderr += data; });
    child.on('exit', status => resolve({ status, stderr }));
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(requests.map(r => r.url).sort(), ['/api/projects/example%20project/issues', '/api/projects/example%20project/requirements']);
  assert.ok(requests.every(r => r.method === 'GET' && r.auth === 'Bearer test-secret-value'));
  const index = readFileSync(join(root, '.architect/requirements-index.json'), 'utf8');
  assert.match(index, /Example problem/);
  assert.equal(index.includes('test-secret-value'), false);
});
