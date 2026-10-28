// Documentation-contract regressions, not an executed agent or server benchmark.
// covers: FR-084 FR-085
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const forming = readFileSync(new URL('../skills/myarchitect/references/forming-nodes.md', import.meta.url), 'utf8');

test('depth is the level count, and a missing level is added rather than worked around', () => {
  assert.match(forming, /Глубина дерева = число уровней/);
  assert.match(forming, /build_hierarchy[\s\S]*move_node[\s\S]*MAX_DEPTH_EXCEEDED/);
  assert.match(forming, /add_hierarchy_level\(\{ pid, name \}\)/);
  assert.match(forming, /вместо того чтобы класть узлы выше их места/);
  assert.doesNotMatch(forming, /фиксируется при ините/);
  assert.doesNotMatch(forming, /Не заводи уровень, которого нет в схеме/);
});

test('presets list five levels and keep simple at two', () => {
  assert.match(forming, /\| `agile` \(default\) \| Epic → Feature → Story → Task → Subtask \|/);
  assert.match(forming, /\| `safe` \| Initiative → Epic → Feature → Story → Task \|/);
  assert.match(forming, /\| `simple` \| Category → Item \|/);
});
