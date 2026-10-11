// Documentation contract checks, not server runtime tests or an executed agent evaluation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = name => readFileSync(new URL(`../skills/myarchitect/${name}`, import.meta.url), 'utf8');
const reference = read('references/requirement-copies.md');

test('ambiguity and migration entry points reach one bounded recovery procedure', () => {
  for (const name of ['SKILL.md', 'references/workflows.md', 'references/product-migration.md']) {
    const content = read(name);
    assert.match(content, /REQUIREMENT_ID_AMBIGUOUS/);
    assert.match(content, /\]\((?:references\/)?requirement-copies\.md\)/);
  }
  assert.doesNotMatch(read('references/workflows.md'), /повтори только неудачные обновления/);
  assert.match(reference, /не требует отдельного полного аудита/);
});

test('documented payloads preserve the selected scope and observed snapshot', () => {
  const calls = [];
  const snapshot = 'a'.repeat(64);
  const context = {
    pid: 'sample', selectedIds: ['FR-7'], selectedIdenticalIds: ['FR-7'],
    operationId: 'saved-repair-01', inspectedSnapshotToken: snapshot,
    inspect_requirement_copies: args => calls.push(['inspect', args]),
    consolidate_requirement_copies: args => calls.push(['consolidate', args]),
  };
  const examples = [...reference.matchAll(/```ts\n([\s\S]*?)\n```/g)];
  assert.equal(examples.length, 2);
  for (const [, code] of examples) vm.runInNewContext(code, context, { timeout: 100 });
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['inspect', { pid: 'sample', requirementIds: ['FR-7'], offset: 0, limit: 50 }],
    ['consolidate', { pid: 'sample', operationId: 'saved-repair-01', expectedSnapshotToken: snapshot, requirementIds: ['FR-7'] }],
  ]);
});

test('failure guidance distinguishes ambiguity, freshness and recorded recovery', () => {
  for (const code of [
    'REQUIREMENT_ID_AMBIGUOUS', 'REQUIREMENT_COPIES_STALE', 'REQUIREMENT_COPIES_CONFLICT',
    'REQUIREMENT_SOURCE_INVALID', 'REQUIREMENT_COPY_OPERATION_REUSED',
    'REQUIREMENT_COPY_RECOVERY_CONFLICT', 'REQUIREMENT_COPY_RECOVERY_INVALID',
    'REQUIREMENT_COPY_RECOVERY_INCOMPLETE', 'REQUIREMENT_STORAGE_UNSAFE',
    'REQUIREMENT_STORAGE_LIMIT_EXCEEDED', 'REQUIREMENT_COPY_LIMIT_EXCEEDED',
    'REQUIREMENT_COPY_OUTCOME_UNCONFIRMED', 'REQUIREMENT_COPY_RESPONSE_INVALID',
  ]) assert.ok(reference.includes(code), code);
  assert.match(reference, /тот же exact request с тем же operationId/);
  assert.match(reference, /наличие реестра/);
  assert.match(reference, /хотя бы status\/updatedAt/);
});

test('behavior fixtures exercise choices across loss, authority and retry boundaries', () => {
  const data = JSON.parse(read('evals/requirement-copies-evals.json'));
  const expected = ['equal-copies-authorized-selection', 'partial-status-write-is-conflict',
    'uncertain-outcome-exact-retry', 'plugin-version-not-server-capability',
    'read-only-and-malformed-source', 'mixed-page-snapshots', 'equal-files-without-registry'];
  assert.deepEqual(data.evals.map(item => item.id), expected);
  assert.equal(new Set(data.evals.map(item => item.id)).size, data.evals.length);
  for (const item of data.evals) {
    assert.ok(item.prompt.length > 100);
    assert.ok(item.assertions.length >= 2);
  }
});
