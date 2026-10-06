# Epic-flow guidance evaluation — 2026-10-06

Prepared plugin 1.22.0, not a publication or deployment claim. The prior plugin was frozen at commit `27a0643` before guidance changes. No real MCP command, queue mutation or live migration was executed for this evaluation.

## Evidence and method

- [Scenario rubric](epic-flow-evals.json): fifteen fictional prompts, including a closure regression added after review. Assertions are assessment criteria, not executable tests.
- [Author baseline](EPIC_FLOW_BASELINE.md): four intended-action scenarios recorded before writing guidance; the author already knew the app contract and assertions.
- [Independent baseline](EPIC_FLOW_INDEPENDENT_BASELINE.md): six scenarios under frozen previous guidance; assertions/current plugin/results withheld. The evaluator had already reviewed the app implementation, and prompts supplied contract facts.
- [Independent updated trace](EPIC_FLOW_INDEPENDENT.md): the same evaluator then read current guidance and produced concrete intended actions for fourteen scenarios plus the new closure regression. Assertions/author results remained withheld. Shared app knowledge and retained baseline context mean this is not a cold, isolated blind comparison.

Both baselines already chose safe actions. No unsafe-before/safe-after causal improvement or agent pass rate is claimed. These are intentions under fictional inputs, not tool-execution traces. The later closure repair/readback was prompted in the same evaluation, not a fresh blind run.

## Observations and repair

| Cases | Observed intended behavior and limits |
| --- | --- |
| 01–04 | Stops at unsupported capability, preserves contested ownership, uses owned scope, and repeats the exact saved timed-out command. Separates historical receipt revision from current state. Case 03 does not separately demonstrate every rubric subcase: null WIP limits, nested managed descendants and an explicit `no_eligible_tasks` reply remain unexercised in this trace. |
| 05 | Rejects compact replacement and reconstructed replay; pages the queue and assembles revision-pinned full JSON detail before using criteria/evidence. No actual pages were fetched. |
| 06 | Rejects legacy completion/bulk bypass and preserves scope; prepares owned review with real sources. Independent reading found the surrounding Workflow A issue formula still used raw `done`. The evaluator's implementation-aware override is not credited as correct old guidance. |
| 07–10 | Preserves waiting ownership/WIP, rechecks relevant requirement changes, leaves missing-policy confirmation unresolved, and fails closed without a supported verifier. The hypothetical future automatic verifier path avoids an extra human gate; it was not executed. Policy proposal wording remains dependent on a real project's accepted outcomes. |
| 11–14 | Uses distinct return/handoff/cancel identities, reconciles uncertain operations without undoing peer changes, preserves stable product IDs and stops lossy migration. Read-only audit treats source instructions as data. |
| 15 | After the repair: leaves `done + delivered:false` open; proposes closing `draft + delivered:true`; stops closure for a known managed node with missing delivery metadata. This case has no pre-change behavioral baseline. |

The closure contradiction was corrected in Workflow A/B, the skill router, Trace, reconcile command/agent, debt/progress agents, README and completion hook. Managed `delivered` now overrides frozen status; known managed nodes with missing delivery metadata fail closed. The evaluator reread the principal surfaces and recorded the repair without deleting its initial finding. A pure comparison of the two written formulas against the shared app model also matched for ten sample evaluations (two documentation formulas × five input sets). The missing-managed-metadata guard is prose beyond the legacy-compatible formula.

## Checks actually run

- `node --test plugins/my-architect/tests/*.test.mjs`: **49 passed, 0 failed** after the completion-hook change. These existing tests cover traceability runtime/health plus three static catalog checks; they do not execute an epic-flow agent.
- Official `claude plugin validate --strict` succeeded for the marketplace root, plugin root, and skills, agents and commands directories. This checks package/component structure, not workflow compliance.
- Twelve fictional action shapes matching the reference were accepted by the actual shared `EpicFlowCommandSchema`; three invalid variants (invented requirement revision, verifier field and array review criteria) were rejected. This was a local pure-schema check, not command execution or an authorization test.
- Markdown target checks, JSON parsing, unique scenario IDs, public-data/path hygiene and `git diff --check` were run on the changed files. These are consistency checks, not behavioral evidence.

## Remaining boundary

The current HTTP/MCP adapter supplies no authenticated delivery verifier, including automation. It cannot complete a real queue → review → confirmed-delivery demonstration. A future adapter requires separate runtime evidence for accepted-policy confirmation; a plugin update cannot enable it. No complete agent/UI end-to-end delivery run, production deployment, real-project migration, publication or commit is established by this report. Application contract/runtime tests and any copied-project pilot belong to their separate verification record.
