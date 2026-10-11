# Workflow defaults 2.0.0 — preparation checks

2026-10-10. Scope: agent guidance and its command/design/agent entry points. Baseline is published plugin 1.23.0 at commit `39a98e577ed2001bbc82e1772b5c1b3e888c4ed1`; its reports and native outcomes are unchanged. This preparation record does not establish publication or installation.

The new rules keep routine sourced decisions within the authorized scope autonomous, allow one supported work node for one result, choose diagrams for actual uncertainty, and provide a self-contained TDD/Trace minimum. Real unresolved product decisions, read-only scope, account authority, project test/CI obligations, migration safety, current/proposed and exact recovery contracts remain.

## Checks executed

- Six new cross-entry documentation checks first ran against the old guidance: five failed on the old confirmation, decomposition, diagram and external-skill gates; the preservation check passed. After the edits all six passed. These are static consistency checks, not observed agent behavior.
- `node --test plugins/my-architect/tests/*.test.mjs`: **85 passed, 0 failed** under Node v25.6.1. This includes all 79 existing checks, including executable traceability/health and migration utility tests, plus the six static checks. No runtime helper or dependency changed.
- Official Claude Code validation with `--strict --json` passed the marketplace and plugin manifests (2.1.285; plugin manifest also checked with cached 2.1.291). Directory calls for skills/agents/commands returned success with `contents:[]`; they are **not evidence of content validation**. Passing individual Markdown files instead is rejected as invalid JSON by that command, so this route is unsupported rather than a failed skill assertion.
- Separately parsed all **20** skill/agent/command frontmatters with the existing Ruby YAML parser and checked required descriptions/names and list-valued tool/skill fields. Changed Markdown relative links, JSON parsing and `git diff --check` passed. This is a bounded format/link check, not a replacement for agent execution.

Written scenarios in `workflow-efficiency-evals.json` cover routine classification and product links, a real local decision with independent progress, single-result work without extra ceremonies, TDD without an external plugin, a flow risk that still benefits from modeling, and read-only/protected-policy boundaries. Expected behavior in the current design/decomposition/initiative/Trace fixtures was updated; historical scores were not recomputed.

The core skill changed from 44,470 to 36,859 UTF-8 bytes and the design skill from 15,373 to 9,856 bytes. These two file sizes are not actual prompt tokens, runtime cost or measured savings.

## Review corrections

An independent semantic review identified three remaining contradictions in the prepared guidance. Useful ownership/acceptance boundaries now have consistent treatment in the decomposition tables, merge check and implementation-notes rule, without requiring PR-sized children. Future enhancements reuse a suitable record and receive a new node only when useful; unknown priority/release stays unassigned. The initiative author's discovery description now routes solution design to the bundled `my-architect:design`, with external brainstorming optional. Existing IDs/history, preset constraints and the feature's observable outcome remain protected.

Three additional static regression checks failed on these contradictions before correction and passed afterward. The complete suite then passed **88 tests, 0 failures** (79 existing executable/contract checks plus nine documentation checks). All 20 frontmatters parsed again, `git diff --check` passed, and official Claude Code strict plugin manifest validation passed; its empty `contents` still does not validate Markdown content. These corrections do not establish native behavioral outcomes.

## Outstanding evidence

Native task execution and confirmation that the review corrections resolve the findings remain separate gates. This report does not claim that the written scenarios passed in an installed host, that agents always populate the product map, or that cost decreased. No live project migration, release or installation was performed by these preparation checks.

## Routing clarification — 2026-10-11

The ordinary catalog and migration instructions previously left the boundary between a new work link and filling an inherited unclassified mapping ambiguous. The core now defines that boundary by the origin of the affected delta, with factual source/mapping evidence. Entry and write references share the rule: an inherited orphan mapping requires the migration package; a new authorized delta in an understood mapped scope uses catalog CAS. A genuinely new proposed feature lacking current behavior does not itself trigger migration. Missing capability leaves only dependent mapping pending.

Added three written cases for these branches and corrected older catalog expectations that permitted direct replacement of legacy inventory. These are expectation updates, not rescored historical runs. Earlier frozen candidates and their observed results remain unchanged; no native-agent pass or cost reduction is inferred from this clarification.

- Existing test suite: **88 passed, 0 failed**; executable helper regressions and documentation checks both ran. The static checks establish consistency, not agent decisions.
- Official `claude plugin validate` passed for marketplace and plugin. All 20 Markdown frontmatters, 19 plugin JSON files and 73 relative links in changed skill Markdown parsed/resolved with the existing local parser.
- The optional skill-creator Python validator could not run because PyYAML is absent from both available Python runtimes. No dependency was installed; official plugin validation and direct frontmatter parsing above succeeded.
- Independent read-only review found no remaining actionable route contradiction. Targeted native validation of the corrected candidate is a separate release check; no new model run, installation, release or live-project write was performed for these checks.
