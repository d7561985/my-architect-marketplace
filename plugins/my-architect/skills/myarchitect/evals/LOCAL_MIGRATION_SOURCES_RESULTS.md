# Local source acquisition guidance — evidence and limits

2026-10-08. Prepared plugin 1.22.0 remains unpublished and uninstalled by this change. Guidance uses the existing single npm executable through `my-architect-mcp local-migration`; keeping one bin preserves npm's existing `npx @my-architect/mcp` selection. The local command dispatch and runtime must actually be available. Agents probe with closed stdin and a bounded timeout because an older MCP executable can ignore argv.

The workflow preserves every supported raw file in one explicitly declared local directory, checks an isolated restore and records stable operation identity. It does not upload files, parse only a convenient record subset, synchronize an index, accept Product Map classification, or implement migration apply/rollback. Runtime package version, Node version and protocol/schema capability are distinct observations.

## Checks executed for this contribution

- Focused CLI suite: **19 tests passed**. Eighteen tests invoke the actual bundled package entrypoint with its local-migration subcommand as child processes on isolated disk fixtures; one uses controlled domain responses to check that even schema-valid envelopes for another pid/sourceId/operationId or manifest digest are rejected. The latter is an adapter contract test, not actual domain execution.
- Subprocess checks cover capability discovery without storage writes; strict commands/flags with bounded JSON-only stdout; malformed raw text, hidden binary, a binary larger than 8 MiB, empty directory, symlink and unexecuted source script; source path/hash/stat preservation; complete capture and explicit restore verification; historical GET/capture replay checks; discarded completed capture response followed by same-ID GET; source deletion with verify/replay; wrong digest; cross-source same-ID conflict; corrupt job diagnostics; pending/incomplete state; failed capture replay and successful GET of its failure.
- Every subprocess runs with a network tripwire for global fetch, HTTP(S) request/get, TCP connection methods and TLS connect. No tripwire fired. This is evidence about those fixture executions and APIs, not an OS-level network sandbox or proof about every future runtime.
- The CLI suite bundles the package entrypoint to private temporary storage and exercises its actual local subcommand dispatch. Npm-bin selection, unchanged legacy MCP stdio behavior, independent oracle and real-source pilot remain separate integration checks, not implied by these 19 tests.
- TypeScript `--noEmit` completed without errors after the CLI changes.
- Existing plugin test suite: **57 passed, 0 failed**. Those remain 46 executable traceability/health checks and 11 pre-existing static guidance checks. No new prose-matching test was added or counted as agent behavior.
- Cached official Claude Code 2.1.291 `plugin validate --strict --json` returned exit0/success for marketplace root, plugin root, skills, agents and commands. The first two reports identify valid manifests with no warnings/errors; the directory reports return `contents:[]`, so these results do not establish per-file validation of every skill/agent/command. Changed reference links resolve, written scenario JSON parses, and `git diff --check` passes.

The initial focused CLI run failed because the entrypoint did not yet exist. Current successful tests followed implementation. The temporary fixture root uses its resolved filesystem path; a macOS symlink ancestor was not relaxed in the runtime to make the tests pass. Raw fixtures and private paths are not included in this public report.

## Integrated evidence added by the coordinator

- Full app suite: **131 files / 1709 passed / 2 skipped / 38 todo**. The 18 local-domain, 19 CLI and 2 package-entrypoint tests are included, not added again. Production/TypeScript build and MCP bundle build succeeded. Vite still reports large chunks.
- Actual npm bin resolver rejects the discarded two-bin design and resolves the final unchanged single bin. Actual bundled legacy SDK initialization/list_tools and the offline capability dispatch both pass. No dependency or package version change; the prepared bundle is not a published release.
- An independent frozen-bundle runner completed **21 scenarios / 53 subprocess calls**, checking all 52 synthetic entries (29 files, 9,440,728 bytes), source/restore equality, independent inodes, concurrent registration, same-ID recovery, five tamper cases and guarded offline execution. This does not claim physical power-loss/no-space/fsync or continuous source-race coverage.
- The original user-declared `.architect` was captured through 7 actual bundled CLI calls: **7 files / 8,953,161 bytes** restored exactly. Source hashes, identities and timestamps stayed unchanged. Its export/index/snapshot contain 1260/1074/1056 requirement records and 278 issue records each; variants remain intact. This is raw acquisition and separate demonstration analysis, not an implemented semantic parser or full migration.
- One **fresh-agent actual CLI trial** read only the prepared entry skill, local-source reference and a private checkpoint. A completed capture response was deliberately withheld in the scenario. The agent executed `capabilities → get → verify` (3 actual calls), retained the same ID and pinned digest, performed no repeated capture and correctly described the uncovered sources and lack of semantic acceptance. One isolated job / 5 files / 482 bytes became verified. The coordinator checked the call log and independent source/restore inventories. This is not an installed-plugin-host trial, real crash injection, eight executed written scenarios or an aggregate behavior pass rate.

## Written expectations, not trials

[`local-migration-sources-evals.json`](local-migration-sources-evals.json) contains **8 fictional scenarios and 32 expected assertions**: missing/old local runtime, explicit root and recorded ID, unknown stdout outcome, historical receipt and tamper, source removal, competing record sets, backup versus taxonomy acceptance, and failed GET/source conflict.

The author read the implementation contract and is not a blind evaluator. These scenarios have not been executed as eight agent trials. Fresh-agent tool execution and an installed-host trial must be reported separately with actual instructions, tool calls and outcomes. No aggregate agent pass rate or token/time saving is claimed.

## Coverage that remains separate

- Complete raw bytes of one declared root do not establish completeness of every local root, browser data, server project or semantic reconciliation. External symlink contents stay excluded; limits/read errors do not become successful partial copies.
- `get_migration_audit` retains its bounded comparison-record input and `fullExportComplete:false`; a past selected subset does not become a full parsed inventory or permit mixing different inputs under one snapshot token.
- Current integrity requires explicit exact-digest verify. GET/replay reports historical receipt with `verificationCheck:not-performed`; pending/failed/incomplete operations are not silently resumed.
- Global discovery, stable feature/area IDs, nested primary placement, aliases/tags, proposed/unresolved decisions and exact source references remain mandatory. A byte-perfect copy does not accept an all-flat import.
- No package publication, plugin installation, cloud transfer, live apply or milestone closure was performed by this contribution.
