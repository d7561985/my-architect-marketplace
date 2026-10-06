# Scoped context guidance — evidence and limits

2026-10-06. Prepared plugin 1.22.0 remains unpublished. This update routes existing Workflow Z/D through global product discovery, explicit feature/work targets, the complete mandatory requirements manifest, exact source windows and a fresh snapshot check on resume. It does not create a new lifecycle or replace taxonomy, claims, Trace or migration inventory.

## Foundation checks actually executed

- `node --test plugins/my-architect/tests/*.test.mjs`: **53 passed, 0 failed**. This is 46 existing executable traceability/health checks, 3 existing static catalog checks and 4 new static scoped-context/entrypoint checks. The new reference/fixture checks first failed against absent guidance; the feature-author allowlist check separately failed before its missing read tools were added. This is documentation/allowlist RED→GREEN, not observed agent behavior or remote MCP acceptance.
- Official cached CLI `@anthropic-ai/claude-code@2.1.291`, invoked through `npm exec --offline --package=@anthropic-ai/claude-code@2.1.291 -- claude plugin validate <path> --strict`: marketplace root, plugin root, skills, agents and commands all passed. These checks validate component structure, not server deployment or runtime support.
- Changed JSON parsed, modified Markdown relative links resolved, and `git diff --check` passed. No dependency, manifest version, publication or project mutation was introduced by this plugin change.

The feature-author agent's allowlist previously omitted both catalog discovery and scoped-context reads. The foundation added `get_product_catalog`, `search_product_features`, `get_scoped_context` and `get_scoped_context_detail`; the additive batch update also grants `get_scoped_context_details`. No write tool was added. Local tool availability still does not establish that a remote backend supports the endpoint.

## Written evaluations

[`scoped-context-evals.json`](scoped-context-evals.json) contains **16 fictional scenarios and 64 expected assertions** (10 foundation scenarios plus 6 additive batch scenarios). They cover category-independent discovery, all mandatory/global requirements and exact windows, stale resume at an unchanged catalog revision, unavailable readers, unknown specification/maturity/document authority, context versus migration/claim boundaries, ancestor/descendant impacts, untrusted source text, creation without an existing target and conflicting/missing sources.

These are written expectations, not sixteen completed agent trials. The author knows the implementation and reviewed the actual shared schemas, HTTP route and MCP adapters. No blind run, aggregate behavior pass rate, causal before/after improvement or token savings is established by these files.

The guidance reflects the current error transport: HTTP provides structured `CONTEXT_*` errors; MCP wraps failed HTTP reads as `isError:true` with `CONTEXT_UNAVAILABLE`, retaining the underlying code/body in error text. A separate machine-readable sourceCode is not claimed. A compact record and source fingerprint are not specification revisions or evidence that the full source was read.

## Actual paired MCP execution

A separate implementation-aware Codex reviewer read the updated scoped-context reference, Workflow Z/D and catalog guidance before executing three tasks, each with three paired baseline/scoped trials in alternating order. This is a Codex-directed deterministic protocol run, not a blind LLM evaluation inside an installed agent host. It does not turn the ten written scenarios into completed trials or establish a model pass rate.

Calls used the actual registered MCP tools, InMemoryTransport, Fastify routes and auth middleware with an isolated test credential, against equivalent disk copies. Fetch was bridged to app.inject; no production endpoint or credential was used. Tool/endpoint allowlists prohibited mutations. The scoped arm followed global discovery where needed, one explicit target, every mandatory manifest page, full mandatory detail windows, relevant work/features/references and explicit gaps on one token. Nontruncated gap/claim metadata did not trigger redundant detail reads.

The baseline actually executed existing catalog/discovery, project/node, inherited requirement, selected document/diagram and flow reads on the same task and prepared data. Both arms used the same app build, including the global-requirement inheritance fix. Synthetic fixture preparation was identical in both copies. The previous 115-call migration inventory answered another question and is not this baseline.

Values are actual UTF-8 bytes of tool-visible text, including repeated fields, errors and JSON overhead. Wall time is the median whole-question duration, including tools and raw-log saves, excluding fixture creation and LLM reasoning. Runs shared the Node process and OS cache; these are not cold-cache or production-throughput measurements.

| Same task/data | Baseline calls | Scoped calls | Baseline text bytes | Scoped text bytes | Median wall baseline → scoped |
|---|---:|---:|---:|---:|---:|
| Copied project: global feature discovery, stable identity/path/links and project constraints | 3 | 21 | 2,459,960 | 63,217 | 0.363 s → 2.138 s |
| Synthetic Unclassified feature: complete requirement manifest and conflicting/missing source facts | 11 | 28 | 11,898 | 63,449 | 0.011 s → 0.113 s |
| Copied project: selected leaf work, related features/work and all mandatory available sources | 22 | 498 | 2,714,341 | 2,567,093 | 1.244 s → 78.467 s |

**Call/time efficiency is not met by this foundation.** Narrow discovery reduces output substantially but needs more round trips. The large inherited context modestly reduces text while greatly increasing calls/time: each scalar detail window rebuilds the bounded context, and the record representation repeats raw value/variant content. The scoped leaf wall range was 58.584–81.385 seconds, baseline 1.163–1.503 seconds. No token, disk-I/O or universal agent-efficiency saving is claimed; NFR-008 remains partial. The additive batch implementation described below is a subsequent slice; its existence alone is not evidence that this limitation has been fixed.

## Source parity, preservation and limits

The independently prepared oracle and comparisons retained exact feature/requirement IDs and checked id/type/title/description/status/ownerNodeId/tracesTo/fields for readable requirements:

- Copied-project discovery: same feature and five global IDs; all five readable records matched exact compared fields. Copied source gaps remained explicit.
- Synthetic task: same feature and twelve requirement-reference IDs; ten readable records matched. The baseline detects the absent requirement through the join but its legacy export selects one physical variant and loses another conflicting variant. Scoped preserves both. This row is an observed workload comparison, **not an equivalent-success efficiency claim**. Its one baseline error is an expected missing-document 404.
- Copied leaf: same two features and all 324 requirement-reference IDs; all 319 readable records matched exact compared fields. Five invalid records retained their raw variants with explicit errors instead of normalization. Thirteen baseline 404s for absent selected documents/diagrams are counted, not treated as successful reads. Neither method had enough available sources to claim a complete decision-ready context. The 117 reported source gaps, 115 affecting collection completeness, are not 117 independently confirmed product defects.

Every measured run preserved its source file set and content hashes. Original copied-project sources and reviewed core hashes also matched before/after. Raw calls, source/core fingerprints, response measurements, timing and parity outputs are retained privately; project/feature/requirement IDs, local paths and source contents are deliberately omitted here. Initial diagnostic runs that stopped on a harness error are excluded; the table uses the corrected runner that records plain-text legacy errors and actual tool parameters.

This proves selected runtime contracts and preserved source facts on these inputs. It does not prove semantic search completeness, external artifact truth, human understanding, accepted taxonomy, local/browser reader parity, completed migration, delivered work, FR-030 specification revisions or plugin publication. Root's browser recordings and application tests are separate evidence from this scripted MCP measurement.


## Additive batch preparation and checks

The prepared plugin now documents `get_scoped_context_details` with one fixed target/token, 1–32 explicit keys, the complete normalized 16 KiB request bound, compact 64/128 KiB `{batch}` output budgets, exact `nextRequests`, explicit deferred records and lossless `scoped-context-shared-variant-v1` reconstruction. Old page and scalar calls retain their contract. The agent must preserve every mandatory manifest key, including keys not yet requested, and finish every required record or report the unread remainder. No automatic adapter fallback is introduced. Compatibility requires an absent tool or the exact old `view.kind` discriminator plus a successful scalar read on the same target/token; incomplete records restart scalar at offset 0. Source/access/stale/malformed errors do not establish unsupported capability.

Executed checks for this update:

- `node --test plugins/my-architect/tests/*.test.mjs`: **54 passed, 0 failed** (46 existing executable traceability/health checks and 8 static catalog/context checks). The changed allowlist and new batch guidance check first failed, then passed after the corresponding reference/allowlist/evaluations were added. This is static guidance evidence, not observed agent behavior.
- Official cached CLI `@anthropic-ai/claude-code@2.1.291` strict validation passed again for marketplace root, plugin root, skills, agents and commands. No dependencies, manifest version, publication or write-tool privileges changed.
- App-side targeted verification: **71 tests passed** across shared batch tests, new MCP boundary tests, unchanged scalar MCP tests and HTTP tests; TypeScript passed. This includes actual registered MCP → HTTP → disk reading of retained Unicode sources through partial/deferred windows, complete source-value reconstruction, one reader invocation per batch, application-envelope byte caps, stale rejection at unchanged catalog revision, no adapter fallback and before/after source-file hashes. This isolated integration fixture is not the paired benchmark above or an installed-host agent trial.

The six new fictional scenarios cover deferred/unrequested mandatory records, explicit unsupported compatibility and scalar offset reset, source errors versus capability, exact variant reconstruction, complete byte budgets and fresh resume without invented efficiency claims. Their 24 assertions are written expectations; no behavior pass rate is claimed. The previous measured table remains the **scalar foundation** result. A new same-task run with unchanged selection and a lossless source oracle is required before reporting batch call/time/byte improvement.


## Verified batch follow-up

A subsequent independent run used the same three tasks, complete selected details and frozen sources, with the **production project-recency hook** registered in authenticated HTTP. The production hook had previously touched project.yaml after read-only POSTs; the application now excludes server-declared read-only context/audit routes while preserving mutation recency. Earlier route-only source-preservation evidence did not cover that hook. Root reproduced the failure before the fix and verified the real hook afterwards.

Three fresh alternating baseline/batch pairs per task (18 measured runs) passed. All decoded details equal the frozen scalar records:14/22/341 full details,5/12/324 mandatory references. Maximum compact batch text was65536 UTF-8 bytes; all source-file sets/hashes and guarded code were unchanged. The independent oracle passed8 named cases plus2 byte-cap observations. This is deterministic actual protocol execution, not an installed-host or blind model evaluation.

| Task | Fresh baseline → batch calls | Tool text bytes | Median seconds |
|---|---:|---:|---:|
| Global discovery and constraints |3 → 8|2,459,960 → 52,902|0.329 → 0.764|
| Unclassified/conflicting sources |11 → 7|11,898 → 52,183|0.010 → 0.040|
| Selected work and all mandatory sources |22 → 33|2,714,341 → 1,637,066|1.097 → 3.384|

Synthetic baseline still loses a conflict variant, so that row is not equivalent-success efficiency evidence. Compared with the historical scalar large-context workflow, calls fall498→33 with exact data parity. Historical scalar78.467s and new batch3.384s used different sessions/builds and Node v25.6.1 versus v22.16.0; no fresh scalar timing A/B is claimed. The fresh baseline is still faster in all three tasks. NFR-008 remains partial; no token/agent reasoning/production latency win is inferred from byte counts.

Final app verification:1604 passed,2 skipped,38 todo in123 files, TypeScript/production/MCP builds pass (existing chunk warning remains). Plugin54 checks and5 strict validation surfaces remain the separately executed checks above. No new plugin source changed after those checks; this paragraph records subsequent application evidence. No publication, installation, acceptance or requirement closure follows from these results.
