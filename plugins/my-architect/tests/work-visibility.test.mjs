// Executable local upgrade checks + documentation contracts, not native agent-evaluation evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
const plugin = fileURLToPath(new URL('../', import.meta.url));
const script = join(plugin, 'scripts/workflow-contract.mjs');
const read = path => readFileSync(join(plugin, path), 'utf8');
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'architect-workflow-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, '.architect'));
  writeFileSync(join(root, '.architect/traceability.json'), JSON.stringify({ projectId: 'sample' }));
  writeFileSync(join(root, 'AGENTS.md'), '# Local rules\nNever publish without permission.\n');
  writeFileSync(join(root, 'CLAUDE.md'), 'my_architect pid: "sample"\n');
  return root;
}
function run(root, ...args) {
  return spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: root } });
}
const record = root => run(root, 'record', '--project-id', 'sample', '--authority-source', 'Owner task accepted in current session');
// covers: FR-062 NFR-014 — portable bounded startup review, never an authorization grant.
test('startup check is read-only and an explicit reviewed receipt becomes quiet until local instructions change', t => {
  const root = fixture(t);
  const before = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  const check = run(root, 'check');
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /work-visibility\.md/);
  assert.equal(existsSync(join(root, '.architect/agent-workflow.json')), false);
  const result = record(root);
  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(readFileSync(join(root, '.architect/agent-workflow.json'), 'utf8'));
  assert.equal(receipt.projectId, 'sample');
  assert.equal(receipt.contractVersion, 1);
  assert.equal(receipt.authoritySource, 'Owner task accepted in current session');
  assert.equal(receipt.instructionHashes['AGENTS.md'].length, 64);
  assert.equal(run(root, 'check').stdout, '');
  writeFileSync(join(root, 'AGENTS.md'), before + 'A new explicit restriction.\n');
  assert.match(run(root, 'check').stdout, /changed|измен/);
  assert.equal(readFileSync(join(root, 'AGENTS.md'), 'utf8'), before + 'A new explicit restriction.\n');
});
test('record requires evidence and matching project identity and never rewrites project instructions', t => {
  const root = fixture(t);
  const before = readFileSync(join(root, 'CLAUDE.md'), 'utf8');
  assert.notEqual(run(root, 'record', '--project-id', 'sample').status, 0);
  assert.notEqual(run(root, 'record', '--project-id', 'other', '--authority-source', 'task').status, 0);
  assert.equal(existsSync(join(root, '.architect/agent-workflow.json')), false);
  assert.equal(record(root).status, 0);
  assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), before);
});
test('corrupt or future receipts are reported and not overwritten', t => {
  const root = fixture(t);
  assert.equal(record(root).status, 0);
  const valid = JSON.parse(readFileSync(join(root, '.architect/agent-workflow.json'), 'utf8'));
  for (const content of ['{bad', JSON.stringify({ schemaVersion: 2, contractVersion: 99, projectId: 'sample' }),
    JSON.stringify({ ...valid, reviewedAt: undefined }), JSON.stringify({ ...valid, reviewedAt: 'yesterday' }),
    JSON.stringify({ ...valid, instructionHashes: {} }),
    JSON.stringify({ ...valid, instructionHashes: { ...valid.instructionHashes, 'AGENTS.md': 'wrong' } }),
  ]) {
    writeFileSync(join(root, '.architect/agent-workflow.json'), content);
    assert.match(run(root, 'check').stdout, /invalid|unsupported/i);
    assert.notEqual(record(root).status, 0);
    assert.equal(readFileSync(join(root, '.architect/agent-workflow.json'), 'utf8'), content);
  }
});
test('receipt symlinks cannot overwrite a different file', t => {
  const root = fixture(t);
  const original = join(root, 'keep.json');
  writeFileSync(original, 'preserve');
  symlinkSync(original, join(root, '.architect/agent-workflow.json'));
  assert.notEqual(record(root).status, 0);
  assert.equal(readFileSync(original, 'utf8'), 'preserve');
});
test('accepted work has one cross-host procedure, proportional scope and no second owner enqueue gate', () => {
  const reference = read('skills/myarchitect/references/work-visibility.md');
  for (const path of ['skills/myarchitect/SKILL.md', 'skills/myarchitect/references/setup.md', 'skills/myarchitect/references/workflows.md', 'commands/next.md', 'commands/init.md']) assert.match(read(path), /work-visibility\.md/, path);
  for (const word of ['enqueue', 'claim_child', 'update_progress', 'AGENTS.md', 'CLAUDE.md', 'Codex', 'authoritySource', 'read-only', 'чужой', 'микро']) assert.ok(reference.toLowerCase().includes(word.toLowerCase()), word);
  assert.doesNotMatch(read('skills/myarchitect/references/workflows.md'), /Creation in Z\/I\/B does not automatically enqueue/);
  assert.doesNotMatch(read('skills/myarchitect/references/epic-flow.md'), /Onboarding — отдельная явная команда/);
  assert.match(read('commands/next.md'), /coordinator.*claim_child/s);
  assert.doesNotMatch(read('commands/next.md'), /Start only ordinary authorized child work with the supported task tool/);
});

// covers: FR-060 FR-061 NFR-014 — request structure stays compatible with holder-only progress.
test('documented progress payload preserves exact revision, own actor and claim without a transition', () => {
  const section = read('skills/myarchitect/references/epic-flow.md').split('### Прогресс без смены владельца или этапа')[1];
  const code = section.match(/```ts\n([\s\S]*?)\n```/)[1];
  const calls = [];
  vm.runInNewContext(code, {
    pid: 'sample', savedProgressId: 'saved-01', observedFlowRevision: 7, sessionActor: 'session-a',
    ownedWorkId: 'child-c1', currentClaimId: 'claim-a', verifiedNextStep: 'Check the recorded regression result',
    apply_epic_flow_command: request => calls.push(request),
  }, { timeout: 100 });
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ pid: 'sample', command: {
    operationId: 'saved-01', expectedRevision: 7, actor: 'session-a',
    action: { type: 'update_progress', nodeId: 'child-c1', claimId: 'claim-a', nextStep: 'Check the recorded regression result' },
  } }]);
});

test('workflow hook recognizes an AGENTS-only binding and stays silent outside Architect projects', t => {
  const root = fixture(t);
  rmSync(join(root, '.architect/traceability.json')); rmSync(join(root, 'CLAUDE.md'));
  const hook = () => spawnSync('bash', [join(plugin, 'hooks/architect-health.sh'), '--workflow'], { cwd: root, encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: root, CLAUDE_PLUGIN_ROOT: plugin } });
  assert.equal(hook().stdout, '');
  writeFileSync(join(root, 'AGENTS.md'), 'my_architect pid: "sample"\n');
  const output = hook();
  assert.equal(output.status, 0, output.stderr);
  assert.match(JSON.parse(output.stdout).hookSpecificOutput.additionalContext, /work-visibility\.md/);
  assert.equal(record(root).status, 0);
  assert.equal(hook().stdout, '');
  const hooks = JSON.parse(read('hooks/hooks.json'));
  assert.match(hooks.hooks.SessionStart[0].matcher, /resume/);
});

test('written behavior cases cover acceptance, foreign ownership, read-only, reuse and backend boundaries', () => {
  const data = JSON.parse(read('skills/myarchitect/evals/work-visibility-evals.json'));
  assert.match(data.scope, /not.*executed/i);
  const expected = ['accepted-work-empty-board', 'microfix-reuse-coordinator-child', 'stale-generated-owner-gate', 'actual-owner-restriction', 'read-only-missing-receipt', 'foreign-agent-no-forged-claim', 'source-failure-is-not-approval', 'progress-unsupported-or-timeout'];
  assert.deepEqual(data.evals.map(item => item.id), expected);
  for (const item of data.evals) { assert.ok(item.prompt.length > 100); assert.ok(item.assertions.length >= 3); }
});
