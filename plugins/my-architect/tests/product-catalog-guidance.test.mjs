// Static contract checks for documentation and fixtures, not agent behavior or MCP integration.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const reference = readFileSync(new URL('../skills/myarchitect/references/product-catalog.md', import.meta.url), 'utf8')
const evals = JSON.parse(readFileSync(new URL('../skills/myarchitect/evals/product-catalog-evals.json', import.meta.url), 'utf8'))

test('catalog documentation distinguishes normalized read schema from remote write support', () => {
  assert.match(reference, /remoteSchemaVersion: 1 \| 2/)
  assert.match(reference, /schemaVersion: 2; areas:/)
  assert.doesNotMatch(reference, /catalog: \{ schemaVersion: 1, areas, features, impacts \}/)
})

test('catalog documentation includes nested-area and feature discovery fields', () => {
  assert.match(reference, /parentId: string \| null/)
  assert.match(reference, /aliases: string\[\]/)
  assert.match(reference, /tags: string\[\]/)
  assert.match(reference, /search_product_features\(/)
  for (const field of ['areaPath', 'matchedOn', 'total', 'offset', 'limit', 'hasMore']) assert.ok(reference.includes(field), field)
})

test('behavior fixtures cover raw-v1 support and category-independent discovery separately', () => {
  const names = new Set(evals.evals.map((item) => item.name))
  for (const name of ['normalized-v2-old-remote', 'category-blind-findability', 'move-retains-feature-identity', 'paged-search-is-not-inventory']) assert.ok(names.has(name), name)
  assert.equal(new Set(evals.evals.map((item) => item.id)).size, evals.evals.length)
  for (const item of evals.evals) assert.ok(item.prompt && item.assertions.length > 0, item.id)
})
