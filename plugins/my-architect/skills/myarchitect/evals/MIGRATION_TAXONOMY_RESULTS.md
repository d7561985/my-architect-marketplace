# Migration taxonomy guidance — evidence and limits

2026-10-06. The migration reference now matches the implemented shared audit/MCP interface for full proposal detail, typed source references, bounded windows and snapshot freshness. This record separates documentation checks, five written scenarios and one actual local runtime workflow. The runtime report below comes from a separate implementation-aware Codex agent; it is not a blind behavior comparison.

## Checks actually run

- `node --test plugins/my-architect/tests/*.test.mjs`: **49 passed, 0 failed**. These are 46 existing executable traceability/health checks and 3 static catalog guidance/fixture checks. They do not execute the new migration audit through an agent host and do not demonstrate a migration behavior pass rate.
- Official cached CLI `@anthropic-ai/claude-code@2.1.291`, invoked with `npm exec --offline --package=@anthropic-ai/claude-code@2.1.291 -- claude plugin validate <path> --strict`: marketplace root, plugin root, skills, agents and commands all **passed**. This validates plugin/component structure, not remote backend support or task completion.
- `git diff --check`: passed. Public guidance/evaluation links and private-path hygiene were checked separately.

## Written evaluation record

[Frozen baseline](MIGRATION_TAXONOMY_BASELINE.md) and [updated intentions](MIGRATION_TAXONOMY_UPDATED.md) preserve four initial prompts plus a fifth follow-up for a justified shallow map. The same evaluator knew the app/design context. The fifth rubric was visible only after the first four written records; no fifth frozen baseline is invented. The final contract readback was performed by the implementation owner after reading actual schemas and adapters.

These are sequential, familiar-context intended actions, **not blind tests, independent runtime execution or a causal RED→GREEN result**. The baseline already chose safe behavior in several cases. No aggregate PASS percentage or accepted taxonomy is claimed.

## Contract points made explicit

- Read `taxonomy.proposalDetailKey` through bounded detail windows with the same input and snapshot token; assemble the exact full candidate, rationale and placement reasons before review.
- `input.proposals[].sourceRefs` uses exact record keys. New taxonomy area/feature sources resolve to read source IDs or valid record keys; a reference alone does not prove its interpretation.
- Remaining null placements stay unresolved even with reasons. A source-grounded shallow map is allowed; examples are not universal categories or required depth.
- `metadataFingerprint` describes observed file metadata, separately from content hashes. Unread bytes and source gaps remain unproven.
- Audit responses always have `canApply:false` and `fullExportComplete:false`; no-doctor read-only audit and separately authorized catalog editing remain distinct.

The separate actual execution below verifies a specific local read-only workflow. It does not turn the five written scenarios into executed cases or establish a pass rate. In particular, that run supplied no taxonomy proposal, did not exercise full proposal detail, and observed no unsupported-backend response; those behaviors are not claimed as runtime evidence here.


## Actual local plugin workflow execution — 2026-10-06

Status: actual read-only execution completed, not a written-intent evaluation. The implementation-aware Codex agent read the updated product catalog and migration references before choosing calls. This was not a cold/blind evaluation and does not establish an agent pass rate.

### Observed behavior

- 115 MCP calls traversed the in-memory MCP client/server and real HTTP loopback preview: 14 GET requests and 101 read-only audit POST requests, all HTTP 200. There were no phase errors. Runtime allowlists blocked mutation tools and endpoints. Dummy preview authentication was used; no live credential or production endpoint was used.
- The full catalog response advertised raw schema v2. Global feature inventory required seven pages at limit two and returned 13 existing features. Their paths used nine areas with maximum depth three, and none were Unclassified. All area/feature classifications remained proposed.
- Literal global search, an alternate-language alias query, and a linked requirement lookup found two related existing features in different branches. An explicitly unrelated category search returned zero candidates. The subsequent global search returned the original two again. This demonstrated the relevant branch-to-global fallback with stable feature IDs; no feature was created or duplicated. It does not prove semantic search completeness.
- Every compact audit section was paged on the same input and snapshot token: seven sources, 2,342 records, 2,319 reconciliation rows, two gaps, 578 source findings, and 13 taxonomy rows. Source statuses were six read and one missing. These are inventory/report counts, not 2,342 fully read document contents or 578 independently confirmed product defects; overlapping reference findings can describe the same underlying missing copied source.
- The 23 submitted local requirements all appeared in reconciliation with status matching. They remained residual because no role/mapping proposals were submitted. This checked the selected source comparison, not all 1,056 local requirements or completion of their implementation.
- Thirteen chosen detail records were assembled from 43 consecutive, token-pinned JSON windows. Twelve included the full selected value; one server record was explicitly out of scope and supplied metadata only. The local counterpart being readable did not turn that server metadata into a full content read.
- Taxonomy remained not-reviewed and unresolved, despite nested paths and zero Unclassified entries. No proposal, owner acceptance or apply permission was fabricated. Every audit response kept fullExportComplete=false and canApply=false.

### Source preservation

Before/after project file manifests and SHA-256 content hashes matched exactly, including the file set. The frozen submitted input and external local requirements index also remained byte-identical during this run. The external index hash matched the input's recorded provenance at the start. No outside update was observed in that interval; the mechanism would report a difference rather than attribute another agent's update to the workflow.

### Limits

The preview is a copied local pilot, with a deliberately limited set of sources: its issue file is missing, copied document/diagram references are not complete, local issues and other local records were not supplied, and full flow operation history was hashed rather than exported. The report explicitly retained partial-export and omitted-history gaps. The workflow did not read all source texts, fetch RFCs or external artifacts, execute product tests, validate actual product availability, approve taxonomy, write a catalog, perform full migration, apply/rollback, publish the plugin or contact production.

The verified result is read-only remote discovery and source reconciliation with preserved inputs. A complete migration and accepted semantic classification remain unfinished.
