# Traceability workflow verification — 2026-09-13

Scope: the locally prepared plugin 1.19.0. These results do not establish publication, a deployed backend version, or successful writes to a live project. Scenario IDs are fictional fixtures.

## Behavioral baseline

An independent `claude` CLI dry-run received the previous Workflow A and a completed, tested feature/requirement linked to one open issue. The requirement started as `approved`. The run used `--safe-mode --tools "" --no-session-persistence`; no project tools or writes were available.

Observed failures:

- Proposed `complete_task({nodeId: "FR-101", ...})` for the requirement, using the node API for a different object.
- Expected `closes` to close the issue automatically. If it remained open, proposed routing the gap to Workflow B instead of updating the issue in the same turn.
- Omitted explicit requirement-status updates and the final derived-index refresh.

The new Workflow A supplies the concrete node → requirement → fresh issue links → issue status → index → validation sequence. Workflow B delegates already-implemented solutions to that sequence.

## Guided scenarios

Five separate CLI runs received the current `SKILL.md`, `references/workflows.md`, `references/traceability.md` and one prompt from `traceability-evals.json`. Tool use and session persistence were disabled. Responses were reviewed against the scenario assertions; this is a qualitative dry-run, not a statistical reliability claim or a live MCP integration test.

| Scenario | Observed behavior |
|---|---|
| 2 — ship-linked-problem | Uses `complete_task` for the node, `update_requirement(... status: "done")` for the proven requirement, then fresh `get_issues`; closes only when nonempty `closedBy` is entirely `done`; follows with index sync and validation. |
| 7 — partial-solution-all-policy | Keeps the issue open while `FR-102` is `approved`; refuses promotion or removal of the real link under deadline pressure; reports the remaining ID. |
| 8 — closed-issue-incomplete-repair | Reopens the incomplete and unlinked closed issues, preserves links, and avoids repeating node completion or promoting unproven requirements. The first response incorrectly described an existing `done` status as proof of historical tests. Workflow A was refined to distinguish status from inspected evidence; a second run explicitly reported that historical evidence had not been rechecked. |
| 9 — bulk-requirement-partial-failure | Retries only the failed ID, reads fresh statuses, branches on the actual result instead of claiming retry success, and keeps a partial issue open. |
| 10 — legacy-approved-and-missing-done-tool | Identifies the incompatible deployed schema and missing test evidence; does not substitute `approved`, call the unsupported mutation, or claim the local version has been published. |

All five scenarios satisfied the reviewed assertions after the scenario 8 refinement. Other entries in `traceability-evals.json` were not rerun in this behavioral pass.

Reproduction: send the three guidance files and the selected scenario prompt to an independent model with tool execution disabled. Request concrete ordered actions, conditional handling of unknown results, and the evidence required for the final report. Review actions and supported claims; keyword matches alone are insufficient.

## Executable checks

- `node --test plugins/my-architect/tests/traceability.test.mjs`: 17 passed, 0 failed. Includes intentional removal of coverage annotations, lost/replaced requirement IDs, disabled/removed CI gates, and healthy/non-Architect hook silence.
- `claude plugin validate plugins/my-architect`: passed.
- `claude plugin validate .`: passed.
- `git diff --check`: passed.
- JSON files parse; the reconciler and debt-scanner allowlists expose requirement updates (single/bulk), issue reads/updates, node completion and project validation. The progress auditor remains read-only.

The behavioral runs did not publish the plugin, change Architect data, execute a remote CI workflow, or prove hosted branch-protection settings.
