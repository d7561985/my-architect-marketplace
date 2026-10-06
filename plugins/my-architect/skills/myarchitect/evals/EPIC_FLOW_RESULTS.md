# Epic-flow guidance evaluation — 2026-10-06

Prepared plugin 1.22.0, not a publication or deployment claim. The prior plugin was frozen at commit `27a0643` before guidance changes. No real MCP command, queue mutation or live migration was executed for this evaluation.

## Evidence and method

- [Scenario rubric](epic-flow-evals.json): twenty-one fictional prompts. The historical evaluation below covered the original fifteen, including a closure regression added after review; six verifier scenarios were added later and have not been run by an evaluator. Assertions are assessment criteria, not executable tests.
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

## Authenticated-verifier guidance increment — 2026-10-06

The application increment now exposes `get_epic_flow_capabilities` and can authenticate an automation verifier from a valid MCP credential. Guidance now requires a real capability response before a new confirmation and uses its exact `verifier.identity` as that new command's actor. It preserves the full original payload for uncertain-operation retries, including after key rotation. An old server, failed probe or malformed response does not establish support. Cookie sessions and local mode do not establish a human verifier.

Capability is separate from accepted delivery policy and evidence. The server validates the modeled review baseline and attributed references; it does not fetch external artifacts or establish their truth. A project writer can technically change the policy, including `requiresHuman`; attribution is not a protected human-approval gate. Guidance forbids inventing acceptance or weakening policy to self-confirm. The earlier traces above remain historical evidence under the earlier adapter boundary; they were not rerun against this increment.

New cases **16–21** address canonical credential identity, rotation and exact replay, unsupported human confirmation, policy weakening, unavailable capability discovery, and artifact-baseline mismatch. **All six are unexecuted rubric cases**. No agent behavioral pass rate or improvement claim follows from adding them.

Checks actually run for this guidance increment:

- Existing plugin tests: **49 passed, 0 failed**. They remain runtime/health and static catalog checks, not an epic-flow agent evaluation.
- Official Claude Code **2.1.291** `plugin validate --strict` passed for the marketplace root, plugin root and skills directory. No package was published.
- The actual shared `EpicFlowCapabilitiesSchema` accepted three fictional responses (MCP automation, unsupported session and unavailable local context); `EpicFlowCommandSchema` accepted one new confirmation using the canonical dummy credential identity. Three invented capability variants and two injected command fields were rejected. These were local schema checks without HTTP requests or commands.
- JSON parsing, **21 unique scenario IDs**, relative Markdown links, public-data/path hygiene and `git diff --check` passed for the changed guidance. Both manifests remain at prepared version **1.22.0**.

Separate application evidence: the increment's targeted run passed **123 tests across seven files**, covering real auth middleware, HTTP confirmation, MCP discovery/transport, and shared model/guards. Its MCP-to-HTTP confirmation used an isolated filesystem and synthetic policy. That evidence supports the technical adapter contract, not a user's policy acceptance, agent compliance with this guide, or availability on a deployed endpoint.

## Remaining boundary

No complete live agent/UI delivery run, production deployment, real-project migration, plugin publication or commit is established by this report. The new capability must be observed on the actual remote with the active credential. Human-verifier support, external artifact truth and protected policy-approval authority remain outside this increment. Application runtime tests and any copied-project pilot belong to their separate verification record.
