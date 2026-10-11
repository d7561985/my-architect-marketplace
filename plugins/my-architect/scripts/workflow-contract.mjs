#!/usr/bin/env node
// Local review receipt only: no network, workflow transitions or instruction rewriting.
import { lstatSync, readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const contractVersion = 1;
const instructionNames = ['AGENTS.md', 'CLAUDE.md'];
const folder = join(root, '.architect');
const path = join(folder, 'agent-workflow.json');
function stat(path) {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
function read(path, limit = 1024 * 1024) {
  const value = stat(path);
  if (!value) return null;
  if (!value.isFile() || value.size > limit) throw new Error('Invalid local source: expected a bounded regular file');
  return readFileSync(path, 'utf8');
}
function inspect() {
  const directory = stat(folder);
  if (directory && !directory.isDirectory()) throw new Error('Invalid .architect directory; symbolic links are not followed');
  const config = read(join(folder, 'traceability.json'));
  const projectId = config ? JSON.parse(config).projectId : undefined;
  const instructionHashes = Object.fromEntries(instructionNames.map(name => {
    const content = read(join(root, name));
    return [name, content === null ? null : createHash('sha256').update(content).digest('hex')];
  }));
  const raw = read(path, 64 * 1024);
  let receipt = null;
  if (raw !== null) {
    try { receipt = JSON.parse(raw); } catch { throw new Error('Invalid workflow receipt JSON; preserve it for review'); }
    const hashes = receipt?.instructionHashes;
    const validHashes = hashes && typeof hashes === 'object' && !Array.isArray(hashes)
      && Object.keys(hashes).length === instructionNames.length
      && instructionNames.every(name => Object.hasOwn(hashes, name) && (hashes[name] === null || typeof hashes[name] === 'string' && /^[a-f0-9]{64}$/.test(hashes[name])));
    const validDate = typeof receipt?.reviewedAt === 'string' && Number.isFinite(Date.parse(receipt.reviewedAt))
      && new Date(receipt.reviewedAt).toISOString() === receipt.reviewedAt;
    if (!receipt || receipt.schemaVersion !== 1 || !Number.isInteger(receipt.contractVersion) || receipt.contractVersion < 1 || receipt.contractVersion > contractVersion || typeof receipt.projectId !== 'string' || !receipt.projectId.trim() || typeof receipt.authoritySource !== 'string' || !receipt.authoritySource.trim() || !validHashes || !validDate) throw new Error('Invalid or unsupported workflow receipt; preserve it for review');
  }
  return { projectId, instructionHashes, receipt, raw };
}
function context(reason) {
  const message = `<architect-workflow>\n${reason}\nRead myarchitect references/work-visibility.md. Reconcile only stale agent-generated AGENTS.md/CLAUDE.md rules against evidenced current owner instructions; preserve real restrictions. Accepted work must become visible through proportional work, enqueue/claim and truthful progress without another permission round. Record .architect/agent-workflow.json only after this review. This check is read-only; a receipt is not authorization or proof of live board state.\n</architect-workflow>`;
  if (process.env.CURSOR_PLUGIN_ROOT) console.log(JSON.stringify({ additional_context: message }));
  else if (process.env.CLAUDE_PLUGIN_ROOT && !process.env.COPILOT_CLI) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: message } }));
  else console.log(message);
}
const [action, ...args] = process.argv.slice(2);
try {
  if (action === 'check') {
    if (args.length) throw new Error('check takes no arguments');
    try {
      const { projectId, instructionHashes, receipt } = inspect();
      if (!receipt) context('Workflow review receipt is missing.');
      else if (receipt.contractVersion !== contractVersion) context('Workflow contract changed; review the upgrade delta.');
      else if (projectId && receipt.projectId !== projectId) context('Project identity changed; reconcile the binding before writes.');
      else if (instructionNames.some(name => receipt.instructionHashes[name] !== instructionHashes[name])) context('Local instructions changed since their workflow review.');
    } catch (error) { context(`Invalid or unsupported local workflow state: ${error.message}`); }
  } else if (action === 'record') {
    const options = {};
    while (args.length) {
      const flag = args.shift(); const value = args.shift();
      if (!['--project-id', '--authority-source'].includes(flag) || options[flag] !== undefined || !value?.trim() || value.startsWith('--') || value.length > 2000) throw new Error('record requires --project-id <verified pid> --authority-source <reviewed owner instruction reference>');
      options[flag] = value;
    }
    if (!options['--project-id'] || !options['--authority-source']) throw new Error('Verified project identity and reviewed owner instruction reference are required');
    const state = inspect();
    if ((state.projectId && state.projectId !== options['--project-id']) || (state.receipt && state.receipt.projectId !== options['--project-id'])) throw new Error('Project identity differs; refusing to replace the workflow receipt');
    const receipt = { schemaVersion: 1, contractVersion, projectId: options['--project-id'], authoritySource: options['--authority-source'], reviewedAt: new Date().toISOString(), instructionHashes: state.instructionHashes };
    mkdirSync(folder, { recursive: true });
    const temporary = join(folder, `.agent-workflow-${randomUUID()}.tmp`);
    try {
      writeFileSync(temporary, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
      if (read(path, 64 * 1024) !== state.raw) throw new Error('Workflow receipt changed during review; inspect before retry');
      renameSync(temporary, path);
    } finally { try { unlinkSync(temporary); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
    console.log('Recorded local workflow review; instructions and live project data were not modified.');
  } else throw new Error('Usage: workflow-contract.mjs check | record --project-id <pid> --authority-source <reference>');
} catch (error) {
  console.error(`Architect workflow: ${error.message}`);
  process.exitCode = 1;
}
