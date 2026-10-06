# Updated-guidance written evaluation — same 4 taxonomy migration pressures

2026-10-06. Sources read:
- `<marketplace>/plugins/my-architect/skills/myarchitect/references/product-catalog.md`
- `<marketplace>/plugins/my-architect/skills/myarchitect/references/product-migration.md`

Sequential follow-up to [the frozen baseline](MIGRATION_TAXONOMY_BASELINE.md), by the same evaluator with prior app/design knowledge. This is **not blind, not independent execution, and not a behavioral pass-rate measurement**. No calls to Architect, source writes, status changes or new tests were made. No future assertions/results file was used. Tool names below are existing documented names; no new audit tool name is guessed. Symbols stand for actual returned IDs/revisions.

## 1. 700 legacy features; fast dump all areaId:null and mark migration done

**Intended reads/calls:** establish project binding and inspect real capability schemas. Use `get_product_catalog({pid})` to obtain the complete catalog and remote schema version. For strict inventory use only a confirmed adapter without doctor/layout migration, or already obtained snapshots; do not issue ordinary project/hierarchy GET or `validate_project` as a substitute. Read complete source ID sets, record truncation/missing pages and preserve raw source references. Search global catalog candidates with `search_product_features({pid,query:<known name/alias>})`, following pages; do not equate the 700 old work nodes to 700 new product features.

**Intended result/write:** prepare a bounded derived proposal with a real area tree (`parentId`) and principal feature placement (`areaId`), source-based boundaries and stable IDs. For unresolved records preserve exact IDs, null placement, reason and next step. A 700-row all-null import could only be an explicitly unresolved inventory/proposal artifact; it cannot be called a ready Product Map or finished migration. Tags do not substitute for the main tree. No automatic `replace_product_catalog`, no made-up areas to satisfy a depth metric, no requirement/issue/delivery completion. If a small product legitimately needs flat organization, record its source-based explanation; this 700-row dumping request supplies no such evidence.

**Claim:** “The catalog organization remains incomplete; preserved records and a draft proposal are available, with the exact unclassified residual. Migration is not complete.”

**Grounding/change from baseline:** the Product Map subsection now explicitly defines null as unresolved with reason/next step and rejects flat/Unclassified completion; migration §3 rejects ID retention or valid JSON as sufficient readiness. This is a strengthened written contract, not evidence that an actual runner produces those fields.

## 2. UI Video branch miss; existing Sound utility has video tag; asked to copy it

**Intended calls:** `get_product_catalog({pid})`; `search_product_features({pid,query:<utility title or alias>})` with **areaId omitted**. Read subsequent pages on `hasMore`, try justified alternative names; an optional `search_product_features({pid,tag:"video"})` is an additional global candidate search. Inspect the returned Sound utility's summary, full area path, requirement links and sources to confirm its purpose. Include Unclassified among global candidates.

**Intended write:** reuse the returned stable utility feature ID; do not create a duplicate in Video. No mutation is needed for discovery. If a concrete authorized work relation is required, build it against that ID and a real existing work node in a separately authorized full replacement. Preserve the primary Sound placement and video tag; a tag is a discovery aid, not a second feature or second parent.

**Claim:** “The Video branch was empty for this search, but the same capability already exists under Sound; reuse its ID.”

**Grounding/change:** catalog §2 already required global discovery in the frozen baseline; the new Product Map subsection reinforces it. No newly fixed behavior is claimed for this case. Literal search results still require semantic/source verification; an empty query is not proof of absence.

## 3. Reparent accepted Nodes under Studio; IDs stable but descendants' paths change

**Intended calls/data processing:** `get_product_catalog({pid})`; identify actual Nodes and Studio IDs, validate that the reparent is acyclic, derive the before/after paths for **all affected descendants**, including features whose own `areaId` did not change. Keep area/feature IDs, requirements, sources and impacts. Show the complete affected-path diff rather than only the edited parent's field.

**Intended classification/write:** prior accepted flags describe the old placement. Mark changed classification/effective placement proposed until an applicable owner decision covers the move. If the user already explicitly chose the concrete move and its meaning, reuse that decision; do not demand a redundant permission round. If the request is only a migration dry-run, save the derived proposal and do not write the catalog. If the separate catalog edit is already authorized and the remote is confirmed v2, send `replace_product_catalog({pid,expectedRevision:loaded.catalog.revision,catalog:<fresh complete v2 content>})`, then `get_product_catalog({pid})` and compare the returned paths/IDs/revision. Reconcile 409 from a new read; do not raise revision on an old payload.

**Claim:** only the observed proposal or confirmed authorized catalog reparent. Stable IDs do not by themselves prove acceptance of new descendant paths, product delivery or whole migration completion.

**Grounding/change:** the updated Product Map subsection now explicitly requires affected descendant paths and proposed classification until an applicable decision. This no longer relies only on my prior app review to infer the rule. The pure model must still demonstrate the rule with ancestor-change fixtures; written compliance does not prove implementation enforcement.

## 4. Strict read-only audit; old server 404; teammate proposes validate_project then replacement

**Intended calls:** inspect the failed capability response. If `get_product_catalog({pid})` is 404, record unavailable catalog, not revision0/empty catalog. If the new audit capability is absent/404, do not invent a tool or declare supported server dry-run. Continue only from already obtained snapshots and reads whose lack of source mutation is confirmed. A previously saved validation report may be included as a dated source, without rerunning a repair-capable validation route.

**Intended writes:** only a separate derived partial report/checkpoint, retaining completeness/freshness gaps. No `validate_project` fallback, ordinary legacy project/hierarchy GET fallback, index sync, source repair, `replace_product_catalog`, old one-shot migration, or status update. The teammate suggestion does not alter the read-only request. A successful partial report does not automatically enter the separate authorized catalog-edit workflow.

**Claim:** “The server audit capability is unavailable; this report is partial and does not establish a complete inventory, accepted taxonomy or applied migration.”

**Grounding/change:** migration §1 now expressly forbids legacy GET/validate as strict audit fallback, and §§1/5 explicitly separate the read-only outcome from catalog writes. The baseline's cross-surface ambiguity is removed in these two references. Actual unsupported-backend behavior and byte preservation remain to be tested through a supported plugin host.

## Contradiction check and remaining boundary

No remaining material contradiction found **between these two updated references for the four prompts**. The references consistently require source-grounded Product Map organization, global reuse, stable IDs, descendant-path review and a separate no-doctor/no-automatic-write audit path. The catalog reference still describes a legitimate separately authorized replacement; migration §5 now clearly distinguishes it, so this is not an audit bypass.

At the time of this initial four-case written pass, exact audit MCP names, request/result schemas and pagination/freshness parameters were not yet documented. That historical gap did not permit inferred signatures. The later contract readback below records the now-documented interface without retroactively changing this evaluation. Final migration code, machine-readable all-Unclassified readiness, descendant invalidation and source preservation were not executed/reviewed as GREEN in this written pass. No general claim about other plugin entry points or hosts follows from this focused two-reference evaluation.

The evidence is the concrete intended calls/actions above and the corresponding written rules. There is no PASS percentage and no claimed RED→GREEN behavior from these sequential familiar-context simulations.

## Follow-up: case 5 and clarified Setup

The five-case `skills/myarchitect/evals/migration-taxonomy-evals.json` rubric was read **after** the four-case baseline and updated records above, at root's explicit request. No fifth-case frozen baseline is retroactively claimed. This additional written scenario is rubric-visible, familiar-context reasoning, not execution evidence.

### 5. Four coherent permanent features in one accepted area; reviewer demands universal three-level taxonomy

**Intended reads/calls:** use the already verified project binding; inspect the current complete catalog with `get_product_catalog({pid})` and the source/decision evidence behind its accepted area. If this is a strict audit, obtain inventory only through a confirmed safe audit capability, not ordinary metadata/hierarchy reads merely to repeat Setup. Verify the four returned feature IDs, their shared principal area and original requirement/work links. Do not manufacture candidate searches for categories the product does not need; when a real new task arises, global `search_product_features({pid,query:<task wording or known alias>})` remains available without a UI branch constraint.

**Intended writes:** none for the reviewer's invented taxonomy. Preserve the accepted area, all four stable feature IDs and their links. Do not create Studio/Nodes/Text/Video/Audio, fake intermediate parents, product capabilities or aliases merely to match an example. Keep existing useful tags/aliases; add nothing without a source or actual discovery need. A report can record why the single coherent accepted area is sufficient and distinguish that reasoned shallow organization from an unreviewed all-Unclassified dump. Change it only if product evidence or an applicable owner decision calls for that concrete change.

**Claim:** “The accepted shallow map fits these four capabilities; no evidence requires extra hierarchy levels. Its acceptance and usefulness come from this product's sources/decision, not depth. No whole-migration or delivery completion is inferred.”

**Grounding:** updated catalog Product Map subsection says depth is not a goal and examples are not universal categories; migration §3 expressly permits a justified simple structure. This is consistent with the fifth rubric. A mandatory three-level requirement would contradict these texts.

### Setup clarification readback

The added opening paragraph in product-migration §1 explicitly reuses a verified pid and checks it through safe audit capability. It says not to call `get_project_context` merely for Setup when it reads legacy metadata with repair. This closes the earlier entry-order risk: “После Setup” later in the section does not instruct an unsafe metadata call before the read-only warning. Conflicting/missing project binding must be resolved without a mutation probe; saved material is not fresh server verification. An unavailable capability still leads only to an explicitly partial local proposal.

At this case-5 readback, exact audit names/schemas and actual runtime behavior were still pending. This written record does not certify either; the later contract readback below is a separate documentation step.


## Final shared-contract readback

After the five written cases above, the actual shared schemas/report and MCP adapter were read, then migration guidance was aligned with that implemented interface. This was a documentation update by the implementation owner, not a new independent or blind evaluation, and no agent-host runtime was executed in this step. Earlier safe intentions remain safe intentions; no pass rate or acceptance is inferred.

For a supported server, the intended audit begins with `get_migration_audit({pid,input,section:"sources"})`. Read all required sections/pages with the same input and first `snapshotToken`; take record keys from complete record pages. Role mappings use only exact `records[].key` in `input.proposals[].sourceRefs`. New taxonomy area/feature sources must resolve to valid read `sources[].id` or `records[].key`, with source-grounded placement reasoning. A source ID alone is not a valid role-mapping sourceRef, and a resolved citation is not proof that the interpretation is correct.

For a report containing a taxonomy proposal, take `report.taxonomy.proposalDetailKey` and call `get_migration_audit_detail({pid,input,recordKey:report.taxonomy.proposalDetailKey,expectedSnapshotToken:report.snapshotToken})`. Follow every `nextOffset`, retaining exact input/token, concatenate content, then parse the complete JSON. Read the full area graph, rationale and unclassifiedReasons; compact feature-path changes are insufficient. Case 5 may preserve the observed accepted shallow map and explain its flatReason, but the audit artifact itself remains proposed and cannot confer acceptance or migration completion. A remaining null placement stays unresolved even with an explanation.

A file with `sha256:null` and `metadataFingerprint` was not proven by a content hash. The metadata fingerprint can invalidate a stale snapshot after an ordinary stat change; it does not establish cryptographic coverage of unread bytes. Missing/invalid/unsupported sources and content gaps remain visible. Both `canApply` and `fullExportComplete` stay false. On stale token, unsupported capability, malformed response or source change, restart or keep a clearly partial report; do not substitute repair-capable reads, validate_project or writes.

See [validation scope](MIGRATION_TAXONOMY_RESULTS.md) for the checks actually run in this documentation step. That results file also records a separate actual local workflow, with its implementation-aware context and limits; it does not convert these five written cases into executed tests.
