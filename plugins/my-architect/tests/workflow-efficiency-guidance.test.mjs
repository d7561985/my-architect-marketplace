// Cross-entry documentation regression checks, not an executed agent evaluation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const skill = read('skills/myarchitect/SKILL.md').split('\n---\n\n**Version:')[0];
const ref = name => read(`skills/myarchitect/references/${name}.md`);

test('routine task entry uses scoped authority without a second confirmation gate', () => {
  assert.doesNotMatch(skill, /Tie-break.*STOP/);
  const feature = read('commands/feature.md');
  assert.doesNotMatch(feature, /WAIT for confirmation|Don't write anything until they approve/);
  assert.match(feature, /authorized scope/);
  assert.match(feature, /read-only/i);
  assert.match(ref('product-catalog'), /принятую агентом в порученном scope либо владельцем/);
});

test('design and initiative entry reuse authority and continue independent work', () => {
  const design = read('skills/design/SKILL.md');
  assert.doesNotMatch(design, /<HARD-GATE>|подтверждение после каждой|Каждый проект проходит процесс/);
  assert.match(design, /независим/);
  assert.match(read('commands/initiative.md'), /already authorized/);
  assert.match(read('agents/initiative-author.md'), /already authorized/);
});

test('decomposition permits a single supported result without removing old nodes', () => {
  for (const text of [skill, ref('workflows')]) assert.doesNotMatch(text, /никогда.*childless|НИКОГДА.*childless/);
  assert.match(ref('workflows'), /Один результат.*одна нода/);
  assert.match(ref('workflows'), /preset/);
  assert.match(ref('forming-nodes'), /не удаляй/);
});

test('diagram choice follows unresolved flow risk rather than epic status', () => {
  assert.doesNotMatch(skill, /Event Storming как контроль последовательности \(сильный default\)/);
  assert.match(skill, /WBS.*USM/);
  assert.match(read('skills/design/SKILL.md'), /риск/);
  assert.doesNotMatch(read('skills/design/SKILL.md'), /Эпик\/инициатива.*Event Storming суб-задачей ДО утверждения/);
});

test('Trace is self-contained without weakening permanent tests or CI', () => {
  const trace = ref('traceability');
  assert.doesNotMatch(trace, /REQUIRED SUB-SKILL|Если skill недоступен, явно назови блокер/);
  for (const text of ['падающий', 'минимальное', 'постоянный', 'CI', 'мутаци']) assert.ok(trace.includes(text), text);
  assert.match(trace, /внешнего skill.*не.*блокер/);
  assert.match(trace, /требования проекта/);
});

test('the simplified lifecycle retains evidence, migration scope and current/proposed boundaries', () => {
  for (const text of ['new', 'change', 'fix', 'technical', 'current/base/proposed', 'Ship = sync']) assert.ok(skill.includes(text), text);
  for (const text of ['operationId', 'expectedRevision', 'current', 'availability']) assert.ok(ref('product-evolution').includes(text), text);
  for (const text of ['Read-only', 'rollback', 'claims', 'scope']) assert.ok(ref('migration-adoption').includes(text), text);
});
