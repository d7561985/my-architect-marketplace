import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const script=fileURLToPath(new URL('../scripts/prepare-migration-package.mjs',import.meta.url));
const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':x&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
const hash=x=>createHash('sha256').update(canonical(x)).digest('hex');
const record=(key,id,digest)=>({key,sourceId:'local-registries',kind:'requirement',id,pointer:key,payloadDigest:digest,contentReference:`local-source:local-registries/${key}`});
function inventory(){const value={schemaVersion:1,pid:'fixture',source:{id:'local-registries',kind:'local-architect',label:'Declared registries',reference:'local-source:local-registries',status:'verified-client',sha256:'a'.repeat(64),recordCount:3,verificationReference:'local-manifest:captured',excludedScopes:['executed-test-results']},records:[record('export/FR-1','FR-1','1'.repeat(64)),record('retained/FR-1','FR-1','2'.repeat(64)),record('snapshot/FR-2','FR-2','3'.repeat(64))],diagnostics:[],sourceVersions:[],semanticComplete:false,recognizedRegistriesParsed:true,testExecutionVerified:false,canApply:false};return {...value,inventoryDigest:hash(value)};}
function plan(){return {packageId:'package-one',reviewMode:'automation',scope:{label:'Independent slice',nodeIds:[],completeProject:false},sources:[],records:[],proposals:[{id:'mapping',sourceRefs:['snapshot/FR-2'],role:'constraint',featureIds:[],rationale:'Read the applicable constraint',status:'proposed'}],catalog:{schemaVersion:2,areas:[],features:[],impacts:[]},rationale:'Preserve conflicting variants as residual',unresolved:[{recordKey:'export/FR-1',reason:'Conflicting wording'},{recordKey:'retained/FR-1',reason:'Conflicting wording'}],serverBackup:{operationId:'backup-one',manifestDigest:'a'.repeat(64)}};}
async function fixture(run){
 const base=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'ma-prepare-plugin-'))),requests=[];
 let cap={schemaVersion:2,pid:'fixture',supported:true,reviewAuthority:'authenticated-principal',reviewModes:['account-session','automation'],automationGuards:{affectedSources:true,accountReviewHolds:true},maxInputBytes:16777216}, response,status=200;
 const server=http.createServer((req,res)=>{let body='';req.on('data',c=>body+=c);req.on('end',()=>{requests.push({url:req.url,method:req.method,body,authorization:req.headers.authorization});if(req.method==='GET'){res.end(JSON.stringify({capabilities:cap}));return;}res.statusCode=status;if(status===302)res.setHeader('location','/credential-leak');const request=JSON.parse(body),baseline={frozen:'server snapshot'},diff={areas:[],features:[],impacts:[]};res.end(JSON.stringify(response??{replayed:false,package:{schemaVersion:1,rulesVersion:1,pid:'fixture',packageId:request.packageId,state:'prepared',request,requestDigest:hash(request),baseline,diff,proposalDigest:hash({request,baseline,diff})}}));});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const save=async(name,value)=>{const target=path.join(base,name);await fs.writeFile(target,JSON.stringify(value),{mode:0o600});return target;};
 const planFile=await save('plan.json',plan()),inventoryFile=await save('inventory.json',inventory()),requestFile=path.join(base,'request.json'),resultFile=path.join(base,'result.json');
 const invoke=(args,env={})=>new Promise(resolve=>{const child=spawn(process.execPath,[script,...args],{env:{...process.env,MA_API_URL:`http://127.0.0.1:${server.address().port}`,MCP_API_KEY:'mcp_fixture-only-key',...env},stdio:['ignore','pipe','pipe']});let stdout='',stderr='';child.stdout.on('data',c=>stdout+=c);child.stderr.on('data',c=>stderr+=c);child.on('close',code=>resolve({code,stdout,stderr}));});
 const compose=(extra=[])=>invoke(['compose','--pid','fixture','--plan-file',planFile,'--inventory-file',inventoryFile,'--output-file',requestFile,...extra]);
 const prepare=()=>invoke(['prepare','--request-file',requestFile,'--output-file',resultFile]);
 try{await run({base,save,invoke,compose,prepare,requests,planFile,inventoryFile,requestFile,resultFile,setCap:v=>cap=v,setResponse:v=>response=v,setStatus:v=>status=v});}finally{await new Promise(resolve=>server.close(resolve));await fs.rm(base,{recursive:true,force:true});}
}
test('offline compose preserves every conflicting physical variant and exact proposal without network or defaults',()=>fixture(async({compose,requests,requestFile,planFile})=>{
 const a=await compose();assert.equal(a.code,0,a.stdout+a.stderr);const saved=JSON.parse(await fs.readFile(requestFile,'utf8'));
 assert.deepEqual(saved,{pid:'fixture',package:{...plan(),sources:[inventory().source],records:inventory().records}});assert.equal(requests.length,0);assert.equal((await fs.stat(requestFile)).mode&0o077,0);assert.equal(JSON.parse(a.stdout).records,3);assert(!a.stdout.includes('Conflicting wording'));
 assert.equal((await compose()).code,0);const legacy=plan();delete legacy.reviewMode;await fs.writeFile(planFile,JSON.stringify(legacy));await fs.unlink(requestFile);assert.equal((await compose()).code,0);assert(!('reviewMode'in JSON.parse(await fs.readFile(requestFile,'utf8')).package));
}));
test('compose refuses tampered, wrong-project and duplicate inventories without partial output',()=>fixture(async({save,compose,inventoryFile,requestFile})=>{
 for(const alter of [x=>x.records.pop(),x=>x.pid='other',x=>x.source.recordCount=2]){const x=inventory();alter(x);await save('inventory.json',x);assert.equal((await compose()).code,1);await assert.rejects(fs.stat(requestFile));}
 await save('inventory.json',inventory());assert.equal((await compose(['--inventory-file',inventoryFile])).code,1);await assert.rejects(fs.stat(requestFile));
}));
test('compose rejects absent provenance, record-count mismatches and private-path references',()=>fixture(async({save,compose,requestFile})=>{
 for(const alter of [x=>x.proposals[0].sourceRefs=['not-read'],x=>x.unresolved.push({recordKey:'not-read',reason:'missing'}),x=>x.sources=[{...inventory().source,id:'extra',recordCount:1}],x=>x.sources=[{...inventory().source,id:'extra',recordCount:0,reference:'/private/source'}]]){const p=plan();alter(p);await save('plan.json',p);assert.equal((await compose()).code,1);await assert.rejects(fs.stat(requestFile));}
}));
test('prepare probes actual v2 then posts exact direct body and retains bound full result',()=>fixture(async({compose,prepare,requests,resultFile,requestFile})=>{
 assert.equal((await compose()).code,0);const r=await prepare();assert.equal(r.code,0,r.stdout+r.stderr);assert.equal(requests.length,2);
 assert.equal(requests[0].url,'/api/projects/fixture/migration-packages/capabilities?protocolVersion=2');assert.equal(requests[1].url,'/api/projects/fixture/migration-packages');assert.equal(requests[1].method,'POST');assert.deepEqual(JSON.parse(requests[1].body),JSON.parse(await fs.readFile(requestFile,'utf8')).package);
 assert.equal((await fs.stat(resultFile)).mode&0o077,0);assert.equal(JSON.parse(r.stdout).state,'prepared');assert(!r.stdout.includes('mcp_fixture'));assert(!r.stdout.includes('retained/FR-1'));
}));
test('unsupported v2, absent holds guard and cross-project caps stop before prepare, with no downgrade',()=>fixture(async({compose,prepare,requests,setCap})=>{
 assert.equal((await compose()).code,0);
 for(const cap of [{schemaVersion:1,pid:'fixture',supported:true},{schemaVersion:2,pid:'other',supported:true},{schemaVersion:2,pid:'fixture',supported:true,reviewAuthority:'authenticated-principal',reviewModes:['automation'],automationGuards:{affectedSources:true,accountReviewHolds:false}}]){setCap(cap);assert.equal((await prepare()).code,1);}
 assert(requests.every(r=>r.method==='GET'));
}));
test('prepare leaves unknown outcomes intact and rejects redirects, changed requests and mismatched result binding',()=>fixture(async({compose,prepare,setStatus,setResponse,resultFile,requests})=>{
 assert.equal((await compose()).code,0);setStatus(302);assert.equal((await prepare()).code,1);assert(!requests.some(r=>r.url==='/credential-leak'));setStatus(200);
 const bad={package:{pid:'other',packageId:'package-one',request:{spoofed:true}}};setResponse(bad);const r=await prepare();assert.equal(r.code,1);assert.equal(JSON.parse(r.stdout).code,'PREPARE_RESPONSE_INVALID');assert(!r.stdout.includes('mcp_fixture'));await assert.rejects(fs.stat(resultFile));
}));
test('private paths, existing evidence and size limits are enforced before posting',()=>fixture(async({base,save,compose,prepare,requestFile,resultFile,inventoryFile,requests})=>{
 await fs.chmod(inventoryFile,0o644);assert.equal((await compose()).code,1);await fs.chmod(inventoryFile,0o600);
 const target=await save('target.json',{old:true});await fs.symlink(target,requestFile);assert.equal((await compose()).code,1);await fs.unlink(requestFile);assert.equal((await compose()).code,0);
 await fs.writeFile(resultFile,'old evidence',{mode:0o600});assert.equal((await prepare()).code,1);assert.equal(await fs.readFile(resultFile,'utf8'),'old evidence');assert.equal(requests.length,0);
 await fs.unlink(resultFile);await fs.writeFile(requestFile,Buffer.alloc(16777217,32));assert.equal((await prepare()).code,1);assert.equal(requests.length,0);
}));

test('legacy absent mode remains unchanged and probes v1 account authority',()=>fixture(async({save,compose,prepare,requests,setCap})=>{
 const p=plan();delete p.reviewMode;await save('plan.json',p);assert.equal((await compose()).code,0);setCap({schemaVersion:1,pid:'fixture',supported:true,reviewAuthority:'authenticated-account-action',maxInputBytes:16777216});const r=await prepare();assert.equal(r.code,0,r.stdout);assert.equal(requests[0].url,'/api/projects/fixture/migration-packages/capabilities');assert(!Object.hasOwn(JSON.parse(requests[1].body),'reviewMode'));
}));
test('network rejection preserves exact machine code but never echoes remote secrets or private text',()=>fixture(async({compose,prepare,setStatus,setResponse,resultFile})=>{
 assert.equal((await compose()).code,0);setStatus(409);setResponse({code:'MIGRATION_PACKAGE_SOURCE_CONFLICT',error:'mcp_fixture-only-key private source details'});const r=await prepare();assert.equal(r.code,1);assert.equal(JSON.parse(r.stdout).remoteCode,'MIGRATION_PACKAGE_SOURCE_CONFLICT');assert.equal(JSON.parse(r.stdout).httpStatus,409);assert(!r.stdout.includes('mcp_fixture'));assert(!r.stdout.includes('private source details'));await assert.rejects(fs.stat(resultFile));
}));

test('valid immutable bindings do not permit arbitrary remote state text in stdout',()=>fixture(async({compose,prepare,setResponse,requestFile,resultFile})=>{
 assert.equal((await compose()).code,0);const request=JSON.parse(await fs.readFile(requestFile,'utf8')).package,baseline={frozen:'server snapshot'},diff={areas:[],features:[],impacts:[]};
 setResponse({replayed:false,package:{schemaVersion:1,rulesVersion:1,pid:'fixture',packageId:request.packageId,state:'mcp_fixture-only-key private source details',request,requestDigest:hash(request),baseline,diff,proposalDigest:hash({request,baseline,diff})}});
 const r=await prepare();assert.equal(r.code,1);assert.equal(JSON.parse(r.stdout).code,'PREPARE_RESPONSE_INVALID');assert(!r.stdout.includes('mcp_fixture'));assert(!r.stdout.includes('private source details'));await assert.rejects(fs.stat(resultFile));
}));

test('compose preserves explicit textual bindings and every physical variant, then probes actual v3',()=>fixture(async({save,compose,prepare,requests,setCap,requestFile})=>{
 const p=plan();p.sourceBindings=[{source:'Historical schedule note',recordKeys:['snapshot/FR-2'],reason:'Read exact original and its stable requirement identity'}];await save('plan.json',p);
 const composed=await compose();assert.equal(composed.code,0,composed.stdout);const saved=JSON.parse(await fs.readFile(requestFile,'utf8'));
 assert.deepEqual(saved.package.sourceBindings,p.sourceBindings);assert.deepEqual(saved.package.records,inventory().records);assert.equal(requests.length,0);
 setCap({schemaVersion:3,sourceBindings:'record-keys',pid:'fixture',supported:true,reviewAuthority:'authenticated-principal',reviewModes:['account-session','automation'],automationGuards:{affectedSources:true,accountReviewHolds:true},maxInputBytes:16777216});
 const prepared=await prepare();assert.equal(prepared.code,0,prepared.stdout);assert.equal(requests[0].url,'/api/projects/fixture/migration-packages/capabilities?protocolVersion=3');assert.deepEqual(JSON.parse(requests[1].body).sourceBindings,p.sourceBindings);
}));
test('binding validation rejects invented keys, overrides, repeated sources and empty rationale before output',()=>fixture(async({save,compose,requestFile,requests})=>{
 for(const binding of [{source:'Note',recordKeys:['missing'],reason:'Read'},{source:'snapshot/FR-2',recordKeys:['export/FR-1'],reason:'Override'},{source:'Note',recordKeys:[],reason:'Empty'},{source:'Note',recordKeys:['snapshot/FR-2','snapshot/FR-2'],reason:'Repeated'},{source:'Note',recordKeys:['snapshot/FR-2'],reason:' '}]){const p=plan();p.sourceBindings=[binding];await save('plan.json',p);assert.equal((await compose()).code,1);await assert.rejects(fs.stat(requestFile));}
 const p=plan(),binding={source:'Note',recordKeys:['snapshot/FR-2'],reason:'Read'};p.sourceBindings=[binding,binding];await save('plan.json',p);assert.equal((await compose()).code,1);await assert.rejects(fs.stat(requestFile));assert.equal(requests.length,0);
}));
test('v2 or unknown v3 cannot silently downgrade a bound request, even account-mode or empty bindings',()=>fixture(async({save,compose,prepare,requests,setCap})=>{
 const p=plan();delete p.reviewMode;p.sourceBindings=[];await save('plan.json',p);const c=await compose();assert.equal(c.code,0,c.stdout);
 for(const cap of [{schemaVersion:2,sourceBindings:'record-keys'},{schemaVersion:3},{schemaVersion:4,sourceBindings:'record-keys'}]){
 setCap({...cap,pid:'fixture',supported:true,reviewAuthority:'authenticated-principal',reviewModes:['account-session','automation'],automationGuards:{affectedSources:true,accountReviewHolds:true},maxInputBytes:16777216});const result=await prepare();assert.equal(result.code,1);assert.equal(JSON.parse(result.stdout).code,'PREPARE_CAPABILITY_UNSUPPORTED');}
 assert.equal(requests.length,3);assert(requests.every(request=>request.method==='GET'&&request.url.endsWith('?protocolVersion=3')));
}));
