// Documentation-contract regressions, not an executed agent or server benchmark.
// covers: FR-082 NFR-020
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const flowPath = 'skills/myarchitect/references/epic-flow.md';
const section = (body, heading) => {
  assert.ok(body.includes(heading), `Missing lifecycle section: ${heading}`);
  return body.split(heading)[1].split('\n## ')[0];
};

test('close and adoption use one explicit epic completion procedure', () => {
  const heading = '## Завершение декомпозиции и явная приёмка эпика';
  const flow = section(read(flowPath), heading);
  for (const path of ['skills/myarchitect/references/workflows.md', 'skills/myarchitect/references/migration-adoption.md']) {
    assert.match(read(path), /epic-flow\.md#завершение-декомпозиции-и-явная-приёмка-эпика/, path);
  }
  assert.match(flow, /обычн[\s\S]*декомпозиц[\s\S]*прогресс/i);
  assert.match(flow, /legacy[\s\S]*явн[\s\S]*приёмк/);
  assert.match(flow, /submit_review[\s\S]*confirm_delivery[\s\S]*managed/);
});

test('last child completion checks readback and does not create another owner gate', () => {
  const flow = section(read(flowPath), '## Завершение декомпозиции и явная приёмка эпика');
  assert.match(flow, /complete_task[\s\S]*cascade[\s\S]*get_node[\s\S]*get_epic_flow/);
  assert.match(flow, /сам[\s\S]*enqueue[\s\S]*claim/);
  assert.match(flow, /без повторного разрешения владельца/);
  assert.match(flow, /критерии[\s\S]*требования[\s\S]*evidence/);
  assert.match(flow, /реальные[\s\S]*policy/i);
});

test('old-server cascade is evidence of a limited result, not permission for blind undo', () => {
  const flow = section(read(flowPath), '## Завершение декомпозиции и явная приёмка эпика');
  assert.match(flow, /стар[\s\S]*сервер[\s\S]*автоматически[\s\S]*done/i);
  assert.match(flow, /верси[\s\S]*плагина[\s\S]*не доказыва/i);
  assert.match(flow, /перезапуск[\s\S]*не hot reload/);
  assert.match(flow, /до и после[\s\S]*параллельн[\s\S]*изменен/);
  assert.match(flow, /не откатывай[\s\S]*вслепую/);
});

test('historical audit distinguishes verified completion, proven error and unknown evidence', () => {
  const flow = section(read(flowPath), '## Завершение декомпозиции и явная приёмка эпика');
  assert.match(flow, /кандидат[\s\S]*не доказательство ошиб/);
  assert.match(flow, /Точная приёмка подтверждена[\s\S]*сохрани/i);
  assert.match(flow, /Ошибка подтверждена[\s\S]*порученн[\s\S]*scope/);
  assert.match(flow, /Доказательств недостаточно[\s\S]*неизвестн/);
  assert.match(flow, /никакого массового сброса[\s\S]*автоматического enqueue[\s\S]*истории/i);
  assert.match(flow, /чужие claims/);
  assert.match(flow, /read-only[\s\S]*без записей/i);
});

test('legacy acceptance preserves old results and does not fabricate delivery or new work', () => {
  const flow = section(read(flowPath), '## Завершение декомпозиции и явная приёмка эпика');
  assert.match(flow, /legacy[\s\S]*complete_task[\s\S]*проверенн/);
  assert.match(flow, /Не создавай фиктивную[\s\S]*delivery/);
  assert.match(flow, /already|уже[\s\S]*done/i);
  assert.match(flow, /доступн[\s\S]*результат[\s\S]*редакци/);
  assert.match(flow, /type[\s\S]*level[\s\S]*preset[\s\S]*префикс/);
  assert.match(flow, /нормализованному[\s\S]*type[\s\S]*epic[\s\S]*initiative[\s\S]*flow/);
  assert.match(flow, /level[\s\S]*preset[\s\S]*контекст[\s\S]*не превращают[\s\S]*Feature[\s\S]*Epic/);
});

test('Workflow A separates managed child completion from legacy summary replacement', () => {
  const workflow = read('skills/myarchitect/references/workflows.md').split('## Workflow A')[1].split('## Workflow B')[0];
  assert.match(workflow, /managed child[\s\S]*release_child[\s\S]*без `summary`/);
  assert.match(workflow, /complete_task\(\{ pid, nodeId \}\)/);
  assert.match(workflow, /подтверждённо unmanaged[\s\S]*summary/);
});

test('issue closure does not accept unverified legacy epic done as an executed acceptance', () => {
  const workflow = read('skills/myarchitect/references/workflows.md').split('## Workflow A')[1].split('## Workflow B')[0];
  const trace = read('skills/myarchitect/references/traceability.md');
  for (const text of [workflow, trace]) {
    assert.match(text, /legacy[\s\S]*эпик[\s\S]*приёмк[\s\S]*неизвестн[\s\S]*не закрывай issue/i);
    assert.match(text, /closedBy[\s\S]*структурн[\s\S]*не[\s\S]*доказательств/);
  }
});

test('progress readers preserve the ordinary rollup vs epic acceptance distinction', () => {
  const auditor = read('agents/progress-auditor.md');
  const command = read('commands/progress.md');
  assert.match(auditor, /status-rollup-lag[\s\S]*ordinary[\s\S]*legacy epic[\s\S]*not automatically drift/);
  assert.match(auditor, /normalized[\s\S]*semantic type[\s\S]*flow[\s\S]*level[\s\S]*preset[\s\S]*do not turn[\s\S]*Feature[\s\S]*Epic/);
  for (const text of [auditor, command]) {
    assert.match(text, /epic-flow\.md#завершение-декомпозиции-и-явная-приёмка-эпика/);
    assert.match(text, /legacy[\s\S]*acceptance/i);
  }
  assert.match(command, /missing verifier[\s\S]*new confirmation[\s\S]*does not invalidate[\s\S]*historical delivery/);
});

test('completion observations are additive guidance and never delivery readiness', () => {
  const flow = section(read(flowPath), '## Завершение декомпозиции и явная приёмка эпика');
  for (const field of ['epicCompletion', 'nodeId', 'legacyStatus', 'childrenComplete', 'deliveryStage', 'nextAction']) assert.ok(flow.includes(field), field);
  for (const action of ['resolve_blocker', 'verify_legacy_outcome', 'continue_child_work', 'already_delivered', 'inspect_epic_flow', 'review_delivery_policy']) assert.ok(flow.includes(action), action);
  assert.match(flow, /не[\s\S]*deliveryReady/);
  assert.match(flow, /отсутств[\s\S]*get_node[\s\S]*get_epic_flow/i);
  assert.match(flow, /childrenComplete[\s\S]*managed child[\s\S]*delivered[\s\S]*не по legacy status/);
});

test('written scenarios include legacy, managed, historical, concurrent and unavailable boundaries', () => {
  const data = JSON.parse(read('evals/epic-flow-completion-evals.json'));
  assert.equal(data.status, 'authored-not-executed');
  const ids = ['last-child-legacy-completion', 'last-child-managed-automation', 'historical-done-verified', 'historical-done-unknown-readonly', 'legacy-cascade-foreign-drift', 'unsupported-epic-reader', 'policy-held-last-child', 'managed-child-summary-preservation', 'legacy-done-open-issue-without-acceptance'];
  for (const id of ids) {
    const item = data.cases.find(c => c.id === id);
    assert.ok(item, id);
    assert.ok(item.input.length > 120, id);
    assert.ok(item.expected.length >= 3, id);
  }
});
