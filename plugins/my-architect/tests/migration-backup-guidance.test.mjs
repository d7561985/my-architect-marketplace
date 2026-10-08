// Static guidance checks. Not an executed agent evaluation or backup runtime proof.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = p => readFileSync(new URL(`../skills/myarchitect/${p}`, import.meta.url), 'utf8')
test('migration entry routes to private server-backup guidance without replacing taxonomy review',()=>{
  assert.match(read('SKILL.md'), /references\/migration-backup\.md/)
  const migration=read('references/product-migration.md')
  assert.match(migration,/migration-backup\.md/)
  for(const existing of ['Unclassified','flatReason','sourceRefs','aliases','product-catalog.md'])assert.ok(migration.includes(existing),existing)
})
test('backup guidance documents actual operation and freshness boundaries',()=>{
  const reference=read('references/migration-backup.md')
  for(const phrase of ['get_migration_backup_capabilities(', 'capture_migration_backup(', 'get_migration_backup(', 'verify_migration_backup(', 'expectedManifestDigest', 'verificationCheck', 'not-performed', 'observed-stable', 'canApply:false', 'server-project', 'local-inputs', 'browser-local', 'workspace-entry', 'external-symlink-targets', 'BACKUP_OUTCOME_UNCONFIRMED'])assert.ok(reference.includes(phrase),phrase)
  assert.match(reference,/operationId/)
  assert.match(reference,/Product Map/)
})
test('written backup scenarios cover unavailable, unknown, failed and tampered outcomes',()=>{
  const data=JSON.parse(read('evals/migration-backup-evals.json'))
  const names=new Set(data.evals.map(e=>e.name))
  for(const name of ['unsupported-is-not-write-probe','unknown-outcome-same-operation','captured-is-not-verified','historical-receipt-not-fresh','server-only-is-not-full-local-backup','backup-does-not-accept-flat-taxonomy','failed-operation-is-not-success','source-deleted-artifact-still-addressed'])assert.ok(names.has(name),name)
  assert.equal(new Set(data.evals.map(e=>e.id)).size,data.evals.length)
  for(const entry of data.evals)assert.ok(entry.prompt&&entry.assertions.length>0)
})
