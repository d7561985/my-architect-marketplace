// covers: FR-063 FR-064 — plugin contracts; UI rendering is verified in the application.
// These checks execute the documented payload and guard guidance, not a native agent evaluation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = path => readFileSync(new URL(`../skills/myarchitect/${path}`, import.meta.url), 'utf8');
const reference = read('references/user-artifacts.md');

test('artifact example remains one node-bound document with complete portable HTML and origin', () => {
  const calls = [];
  const example = reference.match(/```js\n([\s\S]*?)\n```/)[1];
  vm.runInNewContext(example, { create_doc: payload => calls.push(payload) }, { timeout: 100 });
  assert.equal(calls.length, 1);
  assert.deepEqual(Object.keys(calls[0]).sort(), ['content', 'nodeId', 'pid', 'title']);
  const content = calls[0].content;
  assert.match(content, /Origin:.*Версия:/);
  assert.match(content, /```html\n<!doctype html>[\s\S]*<\/html>\n```/);
  assert.doesNotMatch(content, /<script|<iframe|(?:src|href)=["'](?:https?:|file:|localhost)/i);
});

test('saved docIds and sidebar presence cannot stand in for visible node and related product-feature artifacts', () => {
  const verification = reference.split('## 4. Проверка и показ')[1];
  assert.match(verification, /docIds.*сохранени/s);
  assert.match(verification, /HTML-блок/);
  assert.match(verification, /owning node/);
  assert.match(verification, /product feature/);
  assert.match(verification, /sidebar/);
  assert.doesNotMatch(reference, /Если подходящего индекса нет, создай/);
  assert.match(reference, /не создавай.*(?:фич|индекс)/i);
});

test('first-open Preview is checked without a manual mode switch and unavailable UI stays an explicit gap', () => {
  const verification = reference.split('## 4. Проверка и показ')[1];
  assert.match(verification, /первом открытии/);
  assert.match(verification, /HTML Preview/);
  assert.match(verification, /Split/);
  assert.match(verification, /Ручное переключение.*не подтверждает/s);
  assert.match(verification, /стар.*UI|UI.*недоступ/s);
  assert.match(verification, /gap/);
  assert.match(read('references/workflows.md').split('## Workflow C')[1], /видим.*owning node.*product feature.*Preview/s);
});

test('written cases keep earlier permission/canonical limits and add presence, default mode and revision checks', () => {
  const data = JSON.parse(read('evals/user-artifacts-evals.json'));
  assert.match(data.note, /Definitions alone are not evidence/);
  assert.deepEqual(data.evals.map(item => item.id), [
    'local-static-child', 'interactive-revision-gap', 'read-only-small-explanation',
    'stored-but-not-visible', 'linked-feature-first-open-preview', 'existing-artifact-revision',
  ]);
  for (const item of data.evals) { assert.ok(item.assertions.length >= 2); assert.ok(item.prompt.length > 100); }
});
