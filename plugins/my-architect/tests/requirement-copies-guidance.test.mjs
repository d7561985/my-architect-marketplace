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

// covers: FR-067 NFR-015 — executable documented tool payloads, not live server behavior.
test('documented payloads preserve the selected scope and observed snapshot', () => {
  const calls = [];
  const snapshot = 'a'.repeat(64);
  const context = {
    pid: 'sample', selectedIds: ['FR-7'], selectedIdenticalIds: ['FR-7'],
    operationId: 'saved-repair-01', inspectedSnapshotToken: snapshot,
    selectedRequirementId: 'FR-8', detailOffset: 0,
    resolutionOperationId: 'saved-resolution-01',
    acceptedDecisionReference: 'decision:accepted-status-outcome',
    resolutionReason: 'Full sources differ only in the already accepted status outcome.',
    chosenSourcePath: 'nodes/feature-a/requirements/FR-8.yaml', chosenOwnerNodeId: 'feature-a',
    reviewedArchivedSources: [
      { path: 'requirements/requirements.yaml', reason: 'Equivalent to the selected full source; preserve original bytes.' },
      { path: 'nodes/feature-b/requirements/FR-8.yaml', reason: 'Superseded status; preserve original bytes.' },
    ],
    inspect_requirement_copies: args => calls.push(['inspect', args]),
    consolidate_requirement_copies: args => calls.push(['consolidate', args]),
    get_requirement_copy_detail: args => calls.push(['detail', args]),
    resolve_requirement_copies: args => calls.push(['resolve', args]),
    get_requirements: args => calls.push(['requirements', args]),
    get_issues: args => calls.push(['issues', args]),
  };
  const examples = [...reference.matchAll(/```ts\n([\s\S]*?)\n```/g)];
  assert.equal(examples.length, 6);
  for (const [, code] of examples) vm.runInNewContext(code, context, { timeout: 100 });
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['inspect', { pid: 'sample', requirementIds: ['FR-7'], offset: 0, limit: 50 }],
    ['consolidate', { pid: 'sample', operationId: 'saved-repair-01', expectedSnapshotToken: snapshot, requirementIds: ['FR-7'] }],
    ['detail', { pid: 'sample', requirementId: 'FR-8', expectedSnapshotToken: snapshot, offset: 0, limit: 2000 }],
    ['resolve', { pid: 'sample', operationId: 'saved-resolution-01', expectedSnapshotToken: snapshot,
      referencePolicy: 'preserve-existing', resolutions: [{ id: 'FR-8',
        decisionReference: 'decision:accepted-status-outcome',
        reason: 'Full sources differ only in the already accepted status outcome.',
        outputs: [{ sourcePath: 'nodes/feature-a/requirements/FR-8.yaml', targetId: 'FR-8', ownerNodeId: 'feature-a' }],
        archivedSources: [
          { path: 'requirements/requirements.yaml', reason: 'Equivalent to the selected full source; preserve original bytes.' },
          { path: 'nodes/feature-b/requirements/FR-8.yaml', reason: 'Superseded status; preserve original bytes.' },
        ],
      }] }],
    ['requirements', { pid: 'sample', view: 'availability' }],
    ['issues', { pid: 'sample', view: 'availability' }],
  ]);
});

// covers: FR-067 NFR-015 — instructions keep accepted authority and lossless source boundaries.
test('explicit resolution binds full source coverage to accepted authority without automatic winners', () => {
  for (const text of ['resolve-explicit', 'totalChars', 'hasMore:false', 'referencePolicy',
    'decisionReference', 'sourcePath', 'targetId', 'ownerNodeId', 'archivedSources',
    'requires', 'traces', 'каталог', 'документ']) assert.ok(reference.includes(text), text);
  assert.match(reference, /все окна.*одного snapshotToken/);
  assert.match(reference, /каждый источник.*outputs.*archivedSources/);
  assert.match(reference, /один output.*исходный ID/);
  assert.match(reference, /не спрашивай.*каждого ID/);
  assert.match(reference, /ранее принятое решение/i);
  assert.match(reference, /не.*самое новое/i);
  assert.match(reference, /не.*реестр главный/i);
  assert.match(reference, /исходные bytes/);
});

// covers: FR-067 NFR-015 — partial results cannot silently become complete closure evidence.
test('partial availability cannot become an empty or complete authoritative project', () => {
  for (const text of ['complete:false', "view: 'availability'", 'snapshotToken', 'conflicts', 'requirementConflicts']) assert.ok(reference.includes(text), text);
  assert.match(reference, /не текст issues и не epic-flow/);
  assert.match(reference, /полной замены.*индекса/);
  assert.match(reference, /готовност.*закрыти/);
  assert.match(reference, /независим.*работ/);
  assert.match(reference, /без.*view.*строг/);
  assert.match(read('references/workflows.md'), /complete:false/);
  assert.match(read('references/product-migration.md'), /resolve-explicit/);
});

test('failure guidance distinguishes ambiguity, freshness and recorded recovery', () => {
  for (const code of [
    'REQUIREMENT_ID_AMBIGUOUS', 'REQUIREMENT_COPIES_STALE', 'REQUIREMENT_COPIES_CONFLICT',
    'REQUIREMENT_SOURCE_INVALID', 'REQUIREMENT_COPY_OPERATION_REUSED',
    'REQUIREMENT_COPY_RECOVERY_CONFLICT', 'REQUIREMENT_COPY_RECOVERY_INVALID',
    'REQUIREMENT_COPY_RECOVERY_INCOMPLETE', 'REQUIREMENT_STORAGE_UNSAFE',
    'REQUIREMENT_STORAGE_LIMIT_EXCEEDED', 'REQUIREMENT_COPY_LIMIT_EXCEEDED',
    'REQUIREMENT_COPY_OUTCOME_UNCONFIRMED', 'REQUIREMENT_COPY_RESPONSE_INVALID',
    'REQUIREMENT_COPY_INPUT_INVALID', 'REQUIREMENT_COPIES_NOT_DUPLICATED',
  ]) assert.ok(reference.includes(code), code);
  assert.match(reference, /тот же exact request с тем же operationId/);
  assert.match(reference, /наличие реестра/);
  assert.match(reference, /хотя бы status\/updatedAt/);
});

test('behavior fixtures exercise choices across loss, authority and retry boundaries', () => {
  const data = JSON.parse(read('evals/requirement-copies-evals.json'));
  const expected = ['equal-copies-authorized-selection', 'partial-status-write-is-conflict',
    'uncertain-outcome-exact-retry', 'plugin-version-not-server-capability',
    'read-only-and-malformed-source', 'mixed-page-snapshots', 'equal-files-without-registry',
    'accepted-status-outcome-full-sources', 'distinct-requirements-explicit-split',
    'resolution-unknown-outcome', 'availability-independent-work',
    'availability-required-conflict', 'detail-incomplete-or-stale', 'old-server-new-plugin'];
  assert.deepEqual(data.evals.map(item => item.id), expected);
  assert.equal(new Set(data.evals.map(item => item.id)).size, data.evals.length);
  for (const item of data.evals) {
    assert.ok(item.prompt.length > 100);
    assert.ok(item.assertions.length >= 2);
  }
});
