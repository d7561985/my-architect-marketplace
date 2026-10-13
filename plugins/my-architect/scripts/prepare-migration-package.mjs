#!/usr/bin/env node
// Compose is offline. Prepare is an explicit authenticated network operation.
// This bridge preserves metadata; it does not classify, review, apply or repair a project.
import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const INPUT_LIMIT=16*1024*1024, RESPONSE_LIMIT=96*1024*1024;
const PACKAGE_STATES=new Set(['prepared','reviewed','rejected','deferred','applying','applied','verified','rolling-back','rolled-back','conflict']);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':x!==null&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}':JSON.stringify(x);
const hash=x=>sha(canonical(x));
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const digest=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const text=(x,max=4000)=>typeof x==='string'&&x.trim().length>0&&x.length<=max;
const ref=x=>text(x)&&!x.startsWith('/')&&!x.includes('\\')&&!x.split('/').includes('..')&&!/^[a-zA-Z]:/.test(x);
function fail(code){throw Object.assign(new Error(code),{code});}
function requireValue(ok,code='PREPARE_INPUT_INVALID'){if(!ok)fail(code);}
function keys(x,allowed,required=allowed){return object(x)&&Object.keys(x).every(k=>allowed.includes(k))&&required.every(k=>Object.hasOwn(x,k));}
function bounded(value,maxBytes,maxNodes=2_000_000,maxDepth=40){
 let nodes=0;const stack=[[value,0]];
 while(stack.length){const [item,depth]=stack.pop();requireValue(++nodes<=maxNodes&&depth<=maxDepth,'PREPARE_LIMIT_EXCEEDED');if(item&&typeof item==='object')for(const value of Object.values(item))stack.push([value,depth+1]);}
 const bytes=Buffer.from(JSON.stringify(value)+'\n');requireValue(bytes.length<=maxBytes,'PREPARE_LIMIT_EXCEEDED');return bytes;
}
async function ancestors(target){
 requireValue(path.isAbsolute(target),'PREPARE_PATH_UNSAFE');let current=path.parse(target).root;
 for(const name of path.resolve(target).slice(current.length).split(path.sep).filter(Boolean)){current=path.join(current,name);const stat=await fs.lstat(current);requireValue(!stat.isSymbolicLink()&&stat.isDirectory(),'PREPARE_PATH_UNSAFE');}
}
async function privateParent(file){await ancestors(path.dirname(file));const stat=await fs.lstat(path.dirname(file));requireValue(!(stat.mode&0o077),'PREPARE_PATH_UNSAFE');}
async function readJson(file,maxBytes=INPUT_LIMIT){
 requireValue(typeof file==='string'&&path.isAbsolute(file),'PREPARE_PATH_UNSAFE');await privateParent(file);
 const handle=await fs.open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try{const stat=await handle.stat();requireValue(stat.isFile()&&stat.nlink===1&&!(stat.mode&0o077),'PREPARE_PATH_UNSAFE');requireValue(stat.size<=maxBytes,'PREPARE_LIMIT_EXCEEDED');const bytes=await handle.readFile();requireValue(bytes.length<=maxBytes,'PREPARE_LIMIT_EXCEEDED');let data;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{fail('PREPARE_INPUT_INVALID');}bounded(data,maxBytes);return data;}finally{await handle.close();}
}
async function absent(file){await privateParent(file);try{await fs.lstat(file);fail('PREPARE_FILE_CONFLICT');}catch(e){if(e.code!=='ENOENT')throw e;}}
async function writeExclusive(file,value,replay=false){
 const bytes=bounded(value,RESPONSE_LIMIT,8_000_000,50);await privateParent(file);let handle;
 try{handle=await fs.open(file,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,0o600);}catch(e){if(e.code!=='EEXIST'||!replay)fail('PREPARE_FILE_CONFLICT');const previous=await readJson(file);requireValue(canonical(previous)===canonical(value),'PREPARE_FILE_CONFLICT');return {bytes:bytes.length,sha256:sha(bytes),replayed:true};}
 try{await handle.writeFile(bytes);await handle.sync();}finally{await handle.close();}
 const dir=await fs.open(path.dirname(file),constants.O_RDONLY|constants.O_DIRECTORY|constants.O_NOFOLLOW);try{await dir.sync();}finally{await dir.close();}
 return {bytes:bytes.length,sha256:sha(bytes),replayed:false};
}
function validatePackage(p){
 bounded(p,INPUT_LIMIT);
 const required=['packageId','scope','sources','records','proposals','catalog','rationale','unresolved'];
 requireValue(keys(p,[...required,'flatReason','serverBackup','reviewMode','sourceBindings'],required)&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(p.packageId));
 requireValue(!Object.hasOwn(p,'reviewMode')||['automation','account-session'].includes(p.reviewMode));
 requireValue(keys(p.scope,['label','nodeIds','completeProject'])&&text(p.scope.label)&&Array.isArray(p.scope.nodeIds)&&p.scope.nodeIds.length<=1000&&p.scope.nodeIds.every(x=>text(x,256))&&typeof p.scope.completeProject==='boolean');
 requireValue(text(p.rationale)&&(!Object.hasOwn(p,'flatReason')||text(p.flatReason))&&object(p.catalog)&&p.catalog.schemaVersion===2&&['areas','features','impacts'].every(k=>Array.isArray(p.catalog[k])));
 requireValue(!Object.hasOwn(p,'serverBackup')||keys(p.serverBackup,['operationId','manifestDigest'])&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(p.serverBackup.operationId)&&digest(p.serverBackup.manifestDigest));
 requireValue(Array.isArray(p.sources)&&p.sources.length<=1000&&Array.isArray(p.records)&&p.records.length<=100000&&Array.isArray(p.proposals)&&p.proposals.length<=10000&&Array.isArray(p.unresolved)&&p.unresolved.length<=100000);
 const sourceIds=new Set(),recordKeys=new Set(),counts=new Map(),proposalIds=new Set();
 for(const s of p.sources){requireValue(keys(s,['id','kind','label','reference','status','sha256','recordCount','verificationReference','excludedScopes'],['id','kind','label','reference','status','sha256','recordCount','excludedScopes'])&&text(s.id,256)&&text(s.kind,256)&&text(s.label)&&ref(s.reference)&&['verified-client','captured-client','missing','unavailable','not-applicable'].includes(s.status)&&(s.sha256===null||digest(s.sha256))&&Number.isSafeInteger(s.recordCount)&&s.recordCount>=0&&Array.isArray(s.excludedScopes)&&s.excludedScopes.length<=100&&s.excludedScopes.every(x=>text(x))&&(!Object.hasOwn(s,'verificationReference')||text(s.verificationReference))&&!sourceIds.has(s.id));sourceIds.add(s.id);}
 for(const r of p.records){requireValue(keys(r,['key','sourceId','kind','id','pointer','payloadDigest','contentReference'])&&text(r.key)&&text(r.sourceId,256)&&text(r.kind,256)&&text(r.id,256)&&text(r.pointer)&&digest(r.payloadDigest)&&ref(r.contentReference)&&sourceIds.has(r.sourceId)&&!recordKeys.has(r.key));recordKeys.add(r.key);counts.set(r.sourceId,(counts.get(r.sourceId)??0)+1);}
 for(const s of p.sources)requireValue(s.recordCount===(counts.get(s.id)??0));
 if(Object.hasOwn(p,'sourceBindings')){
  requireValue(Array.isArray(p.sourceBindings)&&p.sourceBindings.length<=10000);const boundSources=new Set();
  for(const binding of p.sourceBindings){requireValue(keys(binding,['source','recordKeys','reason'])&&text(binding.source)&&!recordKeys.has(binding.source)&&!boundSources.has(binding.source)&&text(binding.reason)&&Array.isArray(binding.recordKeys)&&binding.recordKeys.length>0&&binding.recordKeys.length<=100000&&new Set(binding.recordKeys).size===binding.recordKeys.length&&binding.recordKeys.every(key=>recordKeys.has(key)));boundSources.add(binding.source);}
 }
 for(const proposal of p.proposals){requireValue(keys(proposal,['id','sourceRefs','role','featureIds','rationale','status'])&&text(proposal.id,256)&&!proposalIds.has(proposal.id)&&Array.isArray(proposal.sourceRefs)&&proposal.sourceRefs.length>0&&proposal.sourceRefs.length<=100&&proposal.sourceRefs.every(x=>text(x,2048)&&recordKeys.has(x))&&['product-feature','change','history','constraint','unresolved'].includes(proposal.role)&&Array.isArray(proposal.featureIds)&&proposal.featureIds.length<=100&&proposal.featureIds.every(x=>text(x,256))&&text(proposal.rationale)&&['proposed','conflict'].includes(proposal.status));proposalIds.add(proposal.id);}
 for(const r of p.unresolved)requireValue(keys(r,['recordKey','reason'])&&recordKeys.has(r.recordKey)&&text(r.reason));
 // Domain schema/reference checks remain the authenticated server's responsibility.
 return p;
}
function parseArgs(){
 const [mode,...args]=process.argv.slice(2);requireValue(['compose','prepare'].includes(mode)&&args.length%2===0);const flags=new Map(),inventories=[];
 const allowed=mode==='compose'?['--pid','--plan-file','--inventory-file','--output-file']:['--request-file','--output-file'];
 for(let i=0;i<args.length;i+=2){const [key,value]=args.slice(i,i+2);requireValue(allowed.includes(key)&&text(value)&&!value.startsWith('--'));if(key==='--inventory-file')inventories.push(value);else{requireValue(!flags.has(key));flags.set(key,value);}}
 requireValue((mode==='compose'?['--pid','--plan-file','--output-file']:['--request-file','--output-file']).every(k=>flags.has(k)));
 return {mode,flags,inventories};
}
function validatePid(pid){requireValue(text(pid,256)&&pid!=='.'&&pid!=='..'&&!/[\\/\0]/.test(pid));}
async function requestJson(url,options,limit){
 const response=await fetch(url,{...options,redirect:'error',signal:AbortSignal.timeout(30000)});
 requireValue(Number(response.headers.get('content-length'))<=limit&&response.body,'PREPARE_LIMIT_EXCEEDED');
 const reader=response.body.getReader(),chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();fail('PREPARE_LIMIT_EXCEEDED');}chunks.push(value);}
 let data;try{data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks,size)));}catch{fail('PREPARE_RESPONSE_INVALID');}bounded(data,limit,8_000_000,50);
 if(!response.ok)throw Object.assign(new Error('PREPARE_REMOTE_UNCONFIRMED'),{code:'PREPARE_REMOTE_UNCONFIRMED',httpStatus:response.status,...(typeof data?.code==='string'&&/^MIGRATION_PACKAGE_[A-Z_]+$/.test(data.code)?{remoteCode:data.code}:{})});
 return data;
}
async function main(){
 const {mode,flags,inventories}=parseArgs(),output=flags.get('--output-file');
 if(mode==='compose'){
  const pid=flags.get('--pid');validatePid(pid);const p=await readJson(flags.get('--plan-file'));requireValue(object(p)&&Array.isArray(p.sources)&&Array.isArray(p.records));
  for(const file of inventories){const inv=await readJson(file);requireValue(object(inv),'PREPARE_INVENTORY_INVALID');const {inventoryDigest,...content}=inv;requireValue(inv.schemaVersion===1&&inv.pid===pid&&digest(inventoryDigest)&&inventoryDigest===hash(content)&&object(inv.source)&&Array.isArray(inv.records)&&inv.source.recordCount===inv.records.length&&inv.records.every(r=>r.sourceId===inv.source.id)&&inv.canApply===false&&inv.testExecutionVerified===false,'PREPARE_INVENTORY_INVALID');p.sources.push(inv.source);for(const record of inv.records)p.records.push(record);}
  validatePackage(p);const saved=await writeExclusive(output,{pid,package:p},true);return {schemaVersion:1,mode,pid,packageId:p.packageId,sources:p.sources.length,records:p.records.length,requestDigest:hash(p),...saved,projectWrites:false};
 }
 const envelope=await readJson(flags.get('--request-file'));requireValue(keys(envelope,['pid','package']));const {pid,package:p}=envelope;validatePid(pid);validatePackage(p);await absent(output);
 requireValue(process.env.MA_API_URL&&process.env.MCP_API_KEY,'PREPARE_CONNECTION_UNAVAILABLE');const base=new URL(process.env.MA_API_URL);requireValue(['http:','https:'].includes(base.protocol)&&!base.username&&!base.password&&!base.search&&!base.hash,'PREPARE_CONNECTION_INVALID');
 const endpoint=base.toString().replace(/\/$/,'')+`/api/projects/${encodeURIComponent(pid)}/migration-packages`,headers={authorization:`Bearer ${process.env.MCP_API_KEY}`,'content-type':'application/json'};
 const automation=p.reviewMode==='automation',bindings=Object.hasOwn(p,'sourceBindings'),version=bindings?3:automation?2:1,cap=(await requestJson(endpoint+'/capabilities'+(version===1?'':`?protocolVersion=${version}`),{headers},65536))?.capabilities;
 requireValue(cap?.pid===pid&&cap.supported===true&&cap.maxInputBytes===INPUT_LIMIT,'PREPARE_CAPABILITY_UNSUPPORTED');
 requireValue(version>1?cap.schemaVersion===version&&(!bindings||cap.sourceBindings==='record-keys')&&cap.reviewAuthority==='authenticated-principal'&&cap.reviewModes?.includes('automation')&&cap.automationGuards?.affectedSources===true&&cap.automationGuards?.accountReviewHolds===true:cap.schemaVersion===1&&cap.reviewAuthority==='authenticated-account-action','PREPARE_CAPABILITY_UNSUPPORTED');
 const result=await requestJson(endpoint,{method:'POST',headers,body:JSON.stringify(p)},RESPONSE_LIMIT),received=result?.package;
 requireValue(typeof result?.replayed==='boolean'&&received?.schemaVersion===1&&received.rulesVersion===1&&received.pid===pid&&received.packageId===p.packageId&&received.requestDigest===hash(p)&&canonical(received.request)===canonical(p)&&received.proposalDigest===hash({request:received.request,baseline:received.baseline,diff:received.diff})&&PACKAGE_STATES.has(received.state),'PREPARE_RESPONSE_INVALID');
 const saved=await writeExclusive(output,result);return {schemaVersion:1,mode,pid,packageId:p.packageId,state:received.state,requestDigest:received.requestDigest,proposalDigest:received.proposalDigest,serverReplayed:result.replayed,...saved,validation:'binding-and-digests; domain-schema-at-server'};
}
try{process.stdout.write(JSON.stringify(await main())+'\n');}catch(error){const code=typeof error?.code==='string'&&/^PREPARE_[A-Z_]+$/.test(error.code)?error.code:'PREPARE_OUTCOME_UNCONFIRMED';process.stdout.write(JSON.stringify({code,...(error?.httpStatus?{httpStatus:error.httpStatus}:{}),...(error?.remoteCode?{remoteCode:error.remoteCode}:{}),error:'Preserve input and any output. For a network attempt, read the same package ID before exact retry; do not change IDs or use raw writes.'})+'\n');process.exitCode=1;}
