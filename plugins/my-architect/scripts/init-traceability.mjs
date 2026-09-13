#!/usr/bin/env node
// Reusable installer. Never guesses project identity/test commands or replaces project files.
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, relative, isAbsolute, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  const options = { testPaths: [], ciFiles: [] };
  const mapping = { '--project-id': 'projectId', '--test-command': 'testCommand', '--test-path': 'testPaths', '--ci-file': 'ciFiles', '--index-path': 'indexPath' };
  const args = process.argv.slice(2);
  while (args.length) {
    const flag = args.shift();
    const field = mapping[flag];
    const value = args.shift();
    if (!field || !value?.trim() || value.startsWith('--')) throw new Error('Usage: init-traceability.mjs --project-id <pid> --test-command <command> --test-path <path> --ci-file <workflow> [--index-path <path>]. Repeat test-path/ci-file as needed.');
    if (Array.isArray(options[field])) options[field].push(value); else options[field] = value;
  }
  if (!options.projectId || !options.testCommand || !options.testPaths.length || !options.ciFiles.length) throw new Error('Project ID, test command, test path and CI file must be resolved from the actual project before init.');
  const root = process.cwd();
  const folder = join(root, '.architect');
  const configPath = join(folder, 'traceability.json');
  const next = { projectId: options.projectId, indexPath: options.indexPath || '.architect/requirements-index.json', testPaths: options.testPaths, testCommand: options.testCommand, coverageCommand: 'node .architect/traceability.mjs check', syncCommand: 'node .architect/traceability.mjs sync', ciFiles: options.ciFiles, waived: [] };
  for (const path of [...next.testPaths, ...next.ciFiles, next.indexPath]) {
    if (isAbsolute(path) || relative(root, resolve(root, path)).split(/[\\/]/).includes('..')) throw new Error('All test, index and CI paths must stay inside the project and be relative.');
  }
  let cfg = next;
  if (existsSync(configPath)) {
    cfg = JSON.parse(readFileSync(configPath, 'utf8'));
    if (cfg.projectId !== options.projectId) throw new Error('Existing projectId differs. Refusing to switch the source or index scope.');
    console.log('Existing traceability config preserved; inspect it before changing commands or scope.');
  } else {
    mkdirSync(folder, { recursive: true });
    writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n', { flag: 'wx' });
  }
  const runtime = join(folder, 'traceability.mjs');
  if (!existsSync(runtime)) copyFileSync(join(dirname(fileURLToPath(import.meta.url)), 'traceability.mjs'), runtime);
  const claude = join(root, 'CLAUDE.md');
  const instructions = existsSync(claude) ? readFileSync(claude, 'utf8') : '';
  const marker = '<!-- my-architect:traceability .architect/traceability.json -->';
  if (!instructions.includes(marker)) {
    writeFileSync(claude, `${instructions}${instructions.endsWith('\n') || !instructions ? '' : '\n'}\n${marker}\nmy_architect pid: ${JSON.stringify(cfg.projectId)}. Traceability config: \`.architect/traceability.json\`.\n- Sync (Architect → repository only): \`${cfg.syncCommand}\`. Supply \`MA_API_URL\` from the configured MCP connection and any \`MCP_API_KEY\` through the environment, or append \`--snapshot <Architect-export.json>\`; no default endpoint is assumed.\n- Tests: \`${cfg.testCommand}\`\n- Required CI gate (tests + requirement coverage): \`${cfg.coverageCommand}\`\nPermanent tests declare \`covers: <requirement-id>\`; exceptions require \`waived: {reason, requirement}\` in the config. Keep these commands and the CI wiring aligned.\n`);
  }
  console.log(`Installed traceability. Run ${cfg.syncCommand} (or append --snapshot <Architect-export.json>), annotate real tests, and wire ${cfg.coverageCommand} into the configured CI. /my-architect:init completes and verifies this setup.`);
} catch (error) {
  console.error(`Architect init: ${error.message}`);
  process.exitCode = 1;
}
