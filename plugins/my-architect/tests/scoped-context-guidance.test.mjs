// Static documentation/fixture checks only, not an agent run or MCP acceptance test.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (file) => readFileSync(new URL(`../skills/myarchitect/${file}`, import.meta.url), 'utf8')

test('feature-author can actually call the discovery and context tools it is instructed to use', () => {
  const agent = readFileSync(new URL('../agents/feature-author.md', import.meta.url), 'utf8')
  for (const tool of ['get_product_catalog', 'search_product_features', 'get_scoped_context', 'get_scoped_context_detail']) assert.ok(agent.includes(`  - mcp__plugin_my-architect_my-architect__${tool}\n`), tool)
})

test('existing create/work entries route to bounded scoped context', () => {
  const workflows = read('references/workflows.md')
  for (const section of [workflows.split('## Workflow Z')[1].split('## Workflow D')[0], workflows.split('## Workflow D')[1].split('## Workflow A')[0]]) {
    assert.match(section, /scoped-context\.md/)
  }
  assert.match(read('SKILL.md'), /references\/scoped-context\.md/)
  assert.match(read('references/product-catalog.md'), /scoped-context\.md/)
  assert.match(read('references/product-migration.md'), /scoped-context\.md/)
})

test('reference documents actual typed target, page and mandatory detail token contract', () => {
  const reference = read('references/scoped-context.md')
  for (const text of ['get_scoped_context(', 'get_scoped_context_detail(', "'product-feature' | 'work'", 'mandatoryRequirements', 'expectedSnapshotToken', 'nextOffset', 'CONTEXT_SNAPSHOT_STALE', 'CONTEXT_UNAVAILABLE']) assert.ok(reference.includes(text), text)
  assert.match(reference, /specRevision: null/)
  assert.match(reference, /maturity: 'unknown'/)
  assert.match(reference, /canonicalDocRole: 'unknown'/)
})

test('written scenarios distinguish mandatory context, stale resume and unavailable support', () => {
  const fixture = JSON.parse(read('evals/scoped-context-evals.json'))
  const names = new Set(fixture.evals.map(item => item.name))
  for (const name of ['global-discovery-to-stable-target', 'mandatory-manifest-is-not-a-preview', 'resume-same-catalog-new-global-source', 'unavailable-is-not-empty', 'no-invented-spec-or-canonical-role', 'context-is-not-migration-or-claim']) assert.ok(names.has(name), name)
  assert.equal(new Set(fixture.evals.map(item => item.id)).size, fixture.evals.length)
  for (const item of fixture.evals) assert.ok(item.prompt && item.assertions.length > 0, item.id)
})
