// covers: FR-078 FR-076 — documentation contract; not browser/network or agent behavior proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const reference=readFileSync(new URL('../skills/myarchitect/references/user-artifacts.md',import.meta.url),'utf8');
test('distinguishes derived preview resource restrictions from preservation of the original',()=>{
 assert.match(reference,/CSP/);
 assert.match(reference,/data:/);
 assert.match(reference,/исходн[\s\S]{0,150}не (?:перезаписыва|меня)/i);
 assert.match(reference,/вне (?:HTML-блока|iframe)/);
 assert.match(reference,/стар[\s\S]{0,100}(?:верси|viewer)/i);
 assert.match(reference,/meta refresh/);
});
test('server PNG export stays limited to node-owned WBS/USM, with explicit unsupported alternatives',()=>{
 assert.match(reference,/export_diagram/);assert.match(reference,/настроенн[\s\S]{0,80}MCP/);
 assert.match(reference,/WBS[\s\S]{0,30}USM/);assert.match(reference,/Box[\s\S]{0,50}Event Storming/);
 assert.match(reference,/unsupported/);assert.match(reference,/не подставляй[\s\S]{0,60}WBS/);
});
