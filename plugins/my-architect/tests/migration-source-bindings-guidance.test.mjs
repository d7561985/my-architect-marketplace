// FR-073 static contract checks; these are not executed agent evaluations.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const reference=read('skills/myarchitect/references/migration-package.md');
test('source bindings are immutable, explicitly negotiated and addressable for complete review',()=>{
 for(const field of ['protocolVersion:3','schemaVersion:3',"sourceBindings:'record-keys'",'sourceBindings:[{source,recordKeys,reason}]',"section:'sourceBindings'",'нет default','точный исходный текст','exact JSON windows','before **и** after','account holds','того же package ID'])assert(reference.includes(field),field);
 assert(reference.includes('дополнительный вопрос владельцу для каждой ссылки не нужен'));
 assert(reference.includes('не доказывает наличие всех не объявленных идентичных физических копий'));
});
test('bounded written cases cover origin, capability, decision and unknown outcome without claiming native proof',()=>{
 const suite=JSON.parse(read('skills/myarchitect/evals/migration-source-bindings-evals.json'));
 assert(suite.scope.includes('not executed native evidence'));assert.equal(new Set(suite.evals.map(e=>e.id)).size,suite.evals.length);
 for(const name of ['authorized-known-origin','missing-original','unsupported-v3','hold-new-spelling','unknown-prepare','removed-before-and-conflicting-copy'])assert(suite.evals.some(e=>e.name===name&&e.prompt&&e.assertions.length>=3),name);
});
