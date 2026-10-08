# Migration backup guidance — evidence and limits

2026-10-08. Prepared plugin 1.22.0 remains unpublished. This addition routes an authorized backup task through actual remote capability discovery, capture with a saved operationId, status readback after unknown outcome, and explicit verification of the exact manifest. Existing nested Product Map/global discovery/source-proposal rules remain mandatory. No apply/rollback tool or generic backup service is claimed.

## Checks actually executed

- `node --test plugins/my-architect/tests/*.test.mjs`: **57 passed, 0 failed**. These are 46 existing executable traceability/health checks plus 11 static catalog/context/backup guidance checks. The three new backup checks first failed against absent entrypoint/reference/evaluation files and then passed. Static checks validate the written guidance and references, not an agent's behavior.
- Official cached CLI `@anthropic-ai/claude-code@2.1.291` strict validation passed for marketplace root, plugin root, skills, agents and commands. No dependencies, manifest version, publication, source-project mutation or agent write-tool privileges were introduced by this plugin update.
- App-side focused run: **50 passed** across new HTTP adapter tests, new MCP adapter tests, two actual MCP→HTTP→disk workflow tests and existing production recency tests. HTTP/MCP reject a captured-only result for a verify action rather than treating it as a completed integrity check. Route/transport tests use controlled domain/HTTP fixtures; the two filesystem workflow tests use actual registered tools, actual auth middleware and production recency hook, isolated disk artifacts and a fixture credential. They cover binary content larger than 8 MiB, malformed raw catalog preservation, hidden/empty/link sources, capture/restore/check, unchanged source file sets/hashes, replay after source deletion, and a deliberately lost response after a real completed capture followed by same-ID readback/replay without a duplicate acquisition.

The isolated workflow tests are implementation-aware deterministic protocol checks. They are not a blind installed-agent-host evaluation, a live project backup, independent evidence about every filesystem race, or the eight written scenarios being executed. Runtime evidence for a separately prepared pilot/oracle, if performed, must be reported separately with its actual source scope and limitations.

## Written evaluations

[`migration-backup-evals.json`](migration-backup-evals.json) contains **8 fictional scenarios and 32 expected assertions**: unavailable capability without write probes; unknown outcome and same-ID readback; captured versus verified; historical receipt versus fresh integrity; server-only versus missing local sources; backup versus Product Map acceptance; failed receipt versus success; and operation access after source deletion.

The author knows the implementation and read the shared/domain/HTTP/MCP contract. These are written expectations, not eight observed trials or an aggregate agent pass rate. No token/time/cost saving is measured or claimed.

## Additional integration observations

The integrated app suite passed 1670 tests across128 files, with2 skipped/38 todo;
production and MCP builds passed. These include the focused tests above.
An independent acceptance harness executed14 synthetic scenarios through52 actual
domain/HTTP/MCP calls, including real fixture authentication and production recency.
Its raw source→manifest/blob→restore equality covered45 entries,22 files,18 directories,
5 links and9,438,004 bytes. A separate isolated, partial pilot used7 MCP→loopback HTTP
calls and preserved all5 source files plus its proposed nested map. Neither run is a
live-project migration, full external-source export, or installed-agent-host trial.

One fresh agent also read only four instruction files, without app implementation,
evaluation fixtures or expected assertions, and answered three scripted observations.
It proposed same-ID GET after capture timeout; explicit same-digest verify after a
historical receipt; and full-catalog/global discovery followed by a proposed diff
instead of flattening all work into accepted Unclassified features. These were
observed textual decisions, not executed tool calls. The scripted observations were
simplified examples rather than complete wire envelopes; no protocol pass rate or
general behavioral reliability is inferred. Installed-host evaluation remains open.

## Contract limits retained in guidance

- Scope is only `server-project`; excluded local inputs (including `.architect` outside that root), browser data, workspace metadata and external symlink target contents remain explicit. A selected local subset does not become a full local backup, and the audit's `fullExportComplete:false` is not changed.
- Consistency is `observed-stable`, not an atomic snapshot or writer fence. Capture and verify mutate private artifacts and preserve source files. Both keep `canApply:false`.
- GET/capture replay report `verificationCheck:not-performed`; a saved receipt is historical. Explicit verify must check the current bundle and saved isolated tree. Failure/incomplete is not silently resumed, and a different manifest digest is a conflict.
- Artifact integrity does not accept nested taxonomy, classify Unclassified entries, implement requirements or authorize live apply. Full local acquisition, enforced live fencing, semantic migration decisions, overlay restore and compensation remain separate work.

No private project IDs, filenames, absolute source/artifact paths, credentials, manifest contents or original source text are included here. This document records the executed checks above; it does not announce a release or completion of the migration milestone.
