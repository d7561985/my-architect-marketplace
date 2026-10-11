// Static routing/contract regression checks, not an executed agent evaluation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const skill=read('skills/myarchitect/SKILL.md');
test('migration intake is reachable before ordinary setup and all entry links resolve',()=>{
 const intake=skill.indexOf('## Первый вход'),setup=skill.indexOf('## Setup');assert(intake>=0&&intake<setup);
 assert(skill.slice(intake,setup).includes('get_project_context'));
 for(const p of ['commands/migrate.md','commands/init.md','skills/myarchitect/references/setup.md'])assert(read(p).includes('product-migration.md'),p);
 for(const p of ['product-migration.md','migration-package.md','migration-adoption.md'])assert(read(`skills/myarchitect/references/${p}`).length>0);
});
test('new migration contract is opt-in and retains real review/account boundaries',()=>{
 const text=read('skills/myarchitect/references/migration-package.md');
 for(const field of ['protocolVersion:2',"reviewMode:'automation'",'review_migration_package({pid,packageId,operationId,expectedReviewRevision',"section:'reviewBlockers'",'accountReviewHolds:true','credential-assertion','humanPresenceVerified:false','compose','--inventory-file','--request-file'])assert(text.includes(field),field);
 assert(!text.includes('review_migration_package` в MCP отсутствует'));
 assert(!text.includes('Используй только при поручении разобрать/перевести'));
 assert(text.includes('Отдельный запрос «мигрируй» не обязателен'));
 assert(!read('skills/myarchitect/references/product-catalog.md').includes('`accepted` — принятую владельцем'));
});
test('adoption distinguishes independent protocols, unknown current and queue from delivery policy',()=>{
 const text=read('skills/myarchitect/references/migration-adoption.md');
 for(const field of ['propose-change','confirm-delivery','set-context','put-scenario','enqueue','scoped-context.md','current неизвестной','не запрещает enqueue/claim/submit_review','только собственный catalog diff'])assert(text.includes(field),field);
});
test('written first-session scenarios never count as native proof',()=>{
 const evals=JSON.parse(read('skills/myarchitect/evals/migration-autonomy-evals.json'));
 assert(evals.scope.includes('not executed'));assert.equal(new Set(evals.evals.map(e=>e.id)).size,evals.evals.length);
 for(const name of ['entry-first-no-repair','conflict-is-local','hold-survives-new-ids','unknown-current-active-queue','native-first-session-evidence','inherited-unclassified-no-package','mapped-scope-new-work-no-remigration','new-proposed-feature-without-current'])assert(evals.evals.some(e=>e.name===name&&e.prompt&&e.assertions.length>=3),name);
});
