// Documentation-contract regressions, not an executed agent or server benchmark.
// covers: FR-086
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../skills/myarchitect/${path}`, import.meta.url), 'utf8');
const skill = read('SKILL.md');
const forming = read('references/forming-nodes.md');
const visibility = read('references/work-visibility.md');
const workflows = read('references/workflows.md');

test('an epic is a finite outcome fixed at creation, not a standing direction', () => {
  assert.match(forming, /\| \*\*Epic\*\* \| крупный \*\*конечный\*\* исход: «было → станет», состав и «вне scope» зафиксированы при заведении \|/);
  assert.match(forming, /\*\*Эпик конечен\.\*\*/);
  assert.match(forming, /а не постоянное направление или возможность продукта/);
  assert.doesNotMatch(forming, /крупный исход \/ направление/);
  assert.match(skill, /Эпик — конечный исход:[\s\S]*новая просьба вне этого исхода идёт новым эпиком, а не в открытый/);
});

test('an open epic takes only work its fixed outcome needs; topic match is not enough', () => {
  assert.match(forming, /только если без неё зафиксированное «станет» не наступит; иначе — новый эпик или отдельная работа, даже в той же области/);
  assert.match(forming, /\*\*Parent\*\* — правильный эпик из live-структуры: работа нужна для его зафиксированного «станет»\. Совпадение темы или области этого не доказывает/);
  assert.match(visibility, /Active эпик, для зафиксированного исхода которого эта работа нужна, уже есть → используй его/);
  assert.match(visibility, /совпадение темы или области само по себе не делает эпик нужным/);
  assert.doesNotMatch(visibility, /Нужный active эпик уже есть → используй его/);
  assert.match(workflows, /подходящий — тот, чей зафиксированный исход требует эту работу, а не тот, чья тема похожа/);
});

test('the feature budget is checked on every addition and scope grows only by an explicit owner decision', () => {
  assert.match(forming, /Бюджет 6–8 фич проверяй при каждом добавлении в существующий эпик, а не только при создании/);
  assert.match(forming, /Расширить состав можно только явной правкой scope по решению владельца/);
});
