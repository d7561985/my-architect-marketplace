# Project setup verification — 2026-09-13

Scope: plugin 1.20.0 and the MCP 1.8.2 project-list help correction. The agent scenarios below are qualitative dry runs with fictional fixture data, not writes to a live Architect project or evidence that a user's repository has been initialized.

## Baseline before the guidance change

An independent agent read the 1.19.1 skill and init command and applied scenarios A–E from `setup-evals.json`. No MCP execution or repository writes were permitted.

Scenario A exposed the failure: a repository with no binding received a single, unrelated project from `list_projects`. The agent said, “I found one Architect project, `analytics-platform`. I’ll connect this repository and configure its test and CI traceability.” It planned to persist the ID without asking because the old setup rule explicitly selected a single result.

B–E already handled explicit creation permission, an agreed saved binding, a list authentication error, and conflicting IDs appropriately in that dry run. They remain regression scenarios rather than claimed baseline failures.

## Guided decisions

A fresh agent read the updated `SKILL.md`, `references/setup.md`, `commands/init.md`, and the project-list tool semantics, then applied A–G. Manual review found all 17 scenario assertions satisfied as intended decisions:

| Scenario | Observed intended behavior |
|---|---|
| A — single unrelated project | Offers the returned project or creation; waits before binding. |
| B — creation already authorized | Reuses the supplied name/simple preset, sets `withSampleContent: false`, verifies the returned ID, and plans local persistence without a repeat question. |
| C — confirmed binding | Reuses the exact ID, skips list/creation, and inspects actual setup gaps. |
| D — list failed | Reports access failure, does not treat it as an empty list or create a project. |
| E — conflicting IDs | Shows both sources, asks which is correct, and preserves files/index meanwhile. |
| F — persistence and restart | Saves the exact selected `path`; a fresh session reads the saved local binding rather than choosing again. |
| G — empty new project | Asks only for missing name/preset, creates without sample content after the user's decision, and distinguishes a saved link from incomplete traceability. |

The first guided review found two wording ambiguities: an unconditional “Always-first” context call and persistence wording that could imply running the installer before test/CI values were known. Both were clarified. An independent follow-up replay of B/G and explicit selection confirmed the revised order. A further review scoped the no-creation rule specifically to a failed project listing, preserving the authorized new-project branch.

Review also caught an unsupported promise about custom hierarchy names: the current scaffold tool has no `levelNames` argument. Setup and the hierarchy reference now state that limitation. A separate read-only scenario H confirmed that a request for `Product → Slice` leads to explaining the limitation and finding a supported configuration path, without sending an invented field, substituting defaults, or claiming creation succeeded. H is retained in the scenario file; it was not part of the 17-assertion A–G run.

Unknown installer, export, test and CI outcomes were left conditional. No historical test results, successful writes, or completed empty-project setup were inferred. These runs establish observed guidance conformance, not a statistical reliability claim.

## Executable hook checks

`node --test plugins/my-architect/tests/traceability.test.mjs`: **46 passed, 0 failed**. Tests execute the real hook/scripts in isolated repositories. Existing installer checks exercise durable config/instruction writes, unchanged instructions on rerun, identity conflict rejection, synchronization and the full gate.

- Initial new hook tests against the old broad detector: **19 failed out of 37**. Failures reproduced prose/example false positives and missing actionable guidance.
- Additional cases cover compact/whitespace legacy `pid`, the canonical setup marker, and Markdown fence/comment/quote boundaries.
- Isolated mutation restoring any-name detection: **27 failed out of 46**.
- Isolated mutation disabling CLAUDE usage detection: **16 failed out of 46**.
- Restored implementation: **46 passed out of 46**.

Paired positive/negative tests retain the brand name while removing the declaration, proving that the positive marker matters. Health does not write a binding or repair project files.

Read-only checks on actual repositories confirmed that the consumer's explicit MCP-project declaration reports missing setup and init/binding guidance, while the marketplace's prose reference to the product repository stays silent. Detection recognizes documented forms; it does not interpret arbitrary natural-language statements.

## Protocol and validation checks

- Real SDK stdio `tools/list` from built MCP 1.8.2 exposes 41 tools. The project-list description changed; all input schemas and other tool metadata match the 1.8.1 baseline. No HTTP requests or project writes occurred.
- Plugin and marketplace manifest validation passed, as did JSON parsing, Bash/Node syntax checks, and `git diff --check`.
- Product MCP build and TypeScript checking passed. The release CI separately runs the product's existing test suite.

To reproduce the guidance checks, send the current skill, setup reference, init command and one scenario to an independent agent with execution disabled. Inspect proposed operations, persistence, questions and claims manually; matching words in the response is not sufficient. Release availability, hosted CI and a real user's complete init require separate evidence.
