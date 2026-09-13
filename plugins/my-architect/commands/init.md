---
description: Initialize or repair Architect → requirements/issues index → permanent tests → CI traceability
---

Use the **myarchitect** skill and its `references/traceability.md`. Complete the setup and its verification in the current project; this command is an implementation workflow, not just advice.

1. **Read facts before choosing commands.** Resolve `pid` through the skill's Setup ladder. Read local `CLAUDE.md`, existing indexes/sync scripts, test runners and CI configuration. Identify the actual permanent test suite, test paths and active CI workflow. Ask the user if the project identity, test scope, or existing scope migration is ambiguous. Do not infer a new project, create example requirements/issues, replace an existing index, or shrink an established requirement set.
2. **Install the missing local tooling.** Run the bundled installer from the project root with the values verified above:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/init-traceability.mjs" \
     --project-id '<resolved-pid>' \
     --test-command '<actual-project-test-command>' \
     --test-path '<permanent-test-directory-or-file>' \
     --ci-file '<actual-ci-workflow-file>'
   ```

   Resolve the installed plugin directory if `CLAUDE_PLUGIN_ROOT` is not available to the command shell. Quote arguments using shell-safe quoting. Repeat `--test-path` and `--ci-file` for multiple paths. `--index-path` selects a verified index location; migration of a legacy schema must preserve every previous requirement ID before adopting the runtime's schema. The installer preserves existing config/runtime/CLAUDE content and rejects a different project ID. On an existing installation, inspect and edit the concrete config/runtime only where repair is needed; rerunning the installer does not upgrade customized files.
3. **Sync real Architect data into the index.** Use the configured sync command. HTTP mode reads the complete project requirements and issues collections; it performs GETs only. Supply `MA_API_URL` from the actual connection configuration and `MCP_API_KEY`, if required, through the shell environment. MCP server child-process environment is not automatically available to shell commands. Never put tokens in config, command history examples, snapshots, or CI files. If an authenticated HTTP connection is unavailable, export `get_requirements({pid})` and `get_issues({pid})` using MCP and write a JSON snapshot with the exact returned data:

   ```json
   {
     "source": "my-architect",
     "projectId": "<resolved-pid>",
     "requirements": [],
     "issues": []
   }
   ```

   The arrays above show the shape only: populate them from the complete real responses, without node/status filters. The runtime refuses an empty requirements collection. Preserve full requirement records, including `closes`; issue records include `id`, `title`, full problem `description`, `status`, `source`, `reported_at`, and `closedBy` from the issue export. Do not copy interview transcripts into issue descriptions. Run the configured sync command with `--snapshot <project-relative-export.json>`. Never reverse-sync the local snapshot/index to Architect.
4. **Connect permanent tests.** Use TDD for new behavior and regressions. Configure test paths to match the real suite; annotate its permanent tests with `covers: <requirement-id>`. Keep any existing requirement IDs and tested scope. Every indexed requirement stays in scope regardless of status. Uncovered or intentionally retired requirements need an explicit config entry `waived: [{"reason":"<verified reason>","requirement":"<id>"}]`; no blanket waiver and no silent exclusion. A requirement removed upstream is retained in the index with that waiver instead of being silently dropped. Do not invent reasons to make the gate green.
5. **Wire the full gate into CI.** Add the configured `coverageCommand` as a dedicated required `run`/`script` step in the actual workflow, with its normal checkout, runtime and dependency setup. The installed gate executes `testCommand` and then checks annotations; invoking the annotation-only `coverage` action is insufficient. Preserve project-specific tooling, use current versions when introducing CI dependencies, and make the gate run automatically for changes. No `continue-on-error`, `allow_failure`, manual-only trigger, ignored exit status, or conditional shell around the gate. The health check recognizes a direct command or a literal/folded YAML block whose only noncomment content is that command. For complex or unsupported CI wiring, simplify to a dedicated step or report the verification gap; don't silence the hook by changing its configured command to a no-op. Commit the synchronized index as a derived artifact so CI can check it without an Architect token. Ensure any repository branch protection required by the project's policy treats this check as required; local static inspection cannot prove hosted branch-protection settings or a completed CI run.
6. **Verify by breaking and restoring.** Run the full gate, then temporarily remove a real covering annotation and observe an uncovered-ID failure. Use a temporary snapshot missing an existing ID (also try replacement with another ID at unchanged count) and observe sync rejection with the original index intact. Temporarily remove/disable the CI gate and run the plugin's `hooks/architect-health.sh`; it must report a CI gap and `/my-architect:init`. Restore the workflow and confirm silence when healthy. Run the full gate again. Keep permanent tests for these behaviors. The plugin's own executable acceptance suite is `node --test plugins/my-architect/tests/traceability.test.mjs` from its marketplace checkout; it also checks that non-Architect projects stay silent. Do not mutate real source data in Architect to test the local gate.
7. **Report the actual result.** List created/changed local paths, the exact sync/test/gate commands, ID counts and mutation evidence. If real requirements lack tests, CI cannot run, no issues exist alongside done requirements, or the source connection is unresolved, report that gap precisely and continue the authorized fixes. A scaffold without a populated index, covering tests and enabled CI is incomplete.

Local contract (`.architect/traceability.json`):

- `projectId`: exact Architect ID; `indexPath`: project-relative derived index.
- `testCommand`: the actual suite to execute; `testPaths`: project-relative files/directories to scan. Directories include `*.test.*` / `*.spec.*` JS/TS files by default; explicit file paths support other languages/runners. Optional `testFilePattern` overrides the directory filter; optional `coversPattern` is a regular expression whose capture group 1 contains whitespace/comma-separated requirement IDs. Keep the scan scope aligned with the tests actually executed.
- `coverageCommand`: `node .architect/traceability.mjs check`, the full gate. `syncCommand`: `node .architect/traceability.mjs sync`. Project-specific commands belong in local config, never in the universal skill.
- `ciFiles`: actual project-relative workflow files containing the dedicated gate; files must exist and visibly execute it. GitHub workflows must have an automatic push/pull-request/merge-group trigger. The conservative check reports conditional/complex YAML as unverified instead of assuming it is safe.
- `waived`: explicit `{reason, requirement}` records. They remain visible in gate output and never erase previous requirement IDs.
- `CLAUDE.md` includes `my_architect pid: "<resolved-pid>"`, exact commands, and `<!-- my-architect:traceability .architect/traceability.json -->`.

The installed runtime requires Node.js 18+ and no packages. Health runs locally, without network, test execution, source mutation, or automatic repair.

$ARGUMENTS
