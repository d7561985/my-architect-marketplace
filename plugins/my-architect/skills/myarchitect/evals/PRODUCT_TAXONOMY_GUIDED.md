> Sanitized evaluator trace: private filesystem paths and the supplied project binding were replaced with generic references. Intended actions are unchanged.

# Updated catalog guidance: intended behavior

Evaluated 2026-10-06 against the updated `SKILL.md`, `references/product-catalog.md`, `references/product-migration.md`, and `evals/product-catalog-evals.json` scenarios catalog-11 through catalog-14 in `the plugin skill directory`.

Method: I completed `PRODUCT_TAXONOMY_BASELINE.md` before reading updated guidance. This is the **same evaluator in sequential context**, not isolated blind tests. I saw the four scenarios' assertions together with their prompts. I did not read author RESULTS/GUIDED/INDEPENDENT reports. Only local files were read and the requested evaluator reports written; there were **no actual MCP/network calls or source-data mutations**. All call snippets below are proposed future calls, not execution evidence. `pid: "<resolved-pid>"` uses the supplied binding, subject to normal Setup verification.

## catalog-11: normalized v2, old or unknown remote format

Intended response:

> The move is already approved. This response says the remote server returned schema 1; the local MCP normalized it into schema 2 for reading. I will preserve the approved move and `pf-export`, but cannot save a v2 replacement until the remote v2 contract is verified. No move has been saved.

The supplied GET is sufficient to determine the present blocker. I would **not** issue `replace_product_catalog`, try a write as a probe, retry as v1, or discard parent/alias/tag fields. I would preserve the complete response, revision 8, `remoteSchemaVersion: 1`, unchanged feature/area IDs, source references, and the approved destination in the proposal/checkpoint. Recording a proposed *operation* does not downgrade the existing feature's accepted classification or available lifecycle.

I would inspect compatible MCP/backend deployment information through available read-only means; tool presence/version is not a substitute for remote support. No deployment operation is authorized just by a request to save this move. The guidance does not provide a separate capability endpoint or a deployment command, so I cannot truthfully specify one. Once the connection is expected to support v2, the required next remote read is:

```js
get_product_catalog({pid: "<resolved-pid>"})
```

Then I require a successful fresh response with `remoteSchemaVersion: 2`, a live `replace_product_catalog` schema that accepts v2, and the existing authorization. I rebuild the move from the fresh full catalog, preserve all unrelated data, and use that response's revision. The target is an existing nested area in this scenario; I do not create an area or a second feature. If target ID/placement details are not actually available, I resolve them from the catalog and recorded approval rather than inventing them. No repeat placement approval is needed.

For the alternate response with no `remoteSchemaVersion`, the immediate action is likewise **no write**, but my explanation is “remote write compatibility is unknown,” not “the remote server is proven v1.” I preserve the exact observed response. Independent read-only source verification and preparing the authorized diff can continue; unrelated new product work is not invented. I can claim only pending authorized work and the observed compatibility state.

Outcome: the intended actions satisfy the remote-format gate, including the missing-field case. No executed proof is available.

## catalog-12: the selected UI branch is empty

Intended response:

> The Operations-only search does not show whether this capability exists elsewhere. I will find “batch publishing” across the product, inspect the candidate's original requirements and documents, and reuse its ID if it is the same capability.

My exact next search is:

```js
search_product_features({
  pid: "<resolved-pid>", query: "batch publishing", offset: 0, limit: 20
})
```

Both `areaId` and `tag` are omitted. In particular, `areaId: null` would be wrong here: it means only unclassified features, not global search. If this query does not retrieve the stated candidate or leaves uncertainty, the concrete alternate search is:

```js
search_product_features({
  pid: "<resolved-pid>", query: "Bulk distribution", offset: 0, limit: 20
})
```

For every relevant query with `hasMore: true`, continue at `offset: page.offset + page.limit` with the same query and no added filters. Record which pages were actually read. A malformed empty page still reporting more data is a retrieval gap, not a reason to assert absence. I would retrieve a complete catalog if text queries leave a possible semantic mismatch; text search does not establish semantic completeness.

I use the returned candidate's actual `feature.id`, `areaPath`, `matchedOn`, `summary`, requirement IDs, sources, and linked-work information. The prompt does not supply its actual ID, so I do not invent `pf-bulk` or another identifier. An alias match is a lead, not proof of equivalent behavior. I read the relevant original requirements, document sections, and linked work before preparing a mutation. One grounded available call is:

```js
get_requirements({pid: "<resolved-pid>"})
```

I select the candidate's exact IDs from that result; source document and work-node read calls depend on IDs actually returned and the live `get_doc` / `get_node` schemas. The prompt and read guidance do not supply enough detail to spell out those dependent argument objects honestly. Unresolvable sources are visible gaps, not deleted links or fabricated evidence.

When those reads confirm matching purpose, I preserve the existing feature ID and its primary area. I describe the requested improvement as the work delta and link the actual work-node ID with a `changes` impact when that work exists. The current UI branch does not cause a move or a duplicate. I reuse the owner's existing authorization and do not ask them to approve routine lookup. I do not set current availability to include the new unimplemented improvement.

Before any catalog mutation I perform `get_product_catalog({pid: "<resolved-pid>"})`, require remote v2 and the supported writer, construct a complete payload at the fresh revision, and preserve all unrelated content. No replacement is needed merely to find the existing capability. If source review contradicts the candidate match, I keep the ambiguity explicit and continue discovery rather than automatically create a feature.

Outcome: global find-before-create and source verification are expressed as concrete intended actions. No duplicate is intended; no source has actually been verified in this simulation.

## catalog-13: move retains identity and existing links

Intended delta, once the existing content and project vocabulary are read:

- Keep the same `pf-export`; change only its primary `areaId` from null to the existing `area-publishing`.
- Keep the existing `area-content` and `area-publishing` IDs and the approved `area-publishing.parentId === "area-content"` relationship. If that relationship is already present it is not a new change; if the approved relationship still needs applying, modify that parent reference in the same proposed delta. Do not construct extra nesting.
- Preserve both requirement IDs, all existing source strings, all three impacts, and every unrelated feature/area/impact. Preserve classification and lifecycle unless a separate supported change is intended.
- Merge the two established names into the feature's useful aliases as appropriate, without duplicating a name already represented by its title/aliases. Merge the two actual cross-cutting topics into the project's tags. The prompt does not provide these strings, so they must come from project sources/current catalog, not invented labels.
- For the newly affecting work epic, read its actual ID and source evidence. Add or update the pair `{featureId: "pf-export", nodeId: actualEpicId}` with `kind: "changes"` and an evidence-based description/source. Do not add a duplicate if this pair already exists among the three impacts; do not pass `pf-export` as a work-node ID. The prompt alone cannot determine whether the final impact count is three or four.

My next catalog read is:

```js
get_product_catalog({pid: "<resolved-pid>"})
```

Resolve the two requirements and relevant feature/epic sources before claiming the new impact is supported. Check the complete loaded ID sets and the approved area shape: unique area/feature IDs, existing area and parent targets, no self-parent or ancestor cycle, valid feature references for impacts, and unique feature/epic pairs. Compare preserved ID sets and link values, not counts alone. An external unresolved reference remains present and is explicitly reported.

Provided the **fresh** response still confirms remote schema 2, revision 12, and the v2 writer, my intended write is:

```js
replace_product_catalog({
  pid: "<resolved-pid>",
  expectedRevision: 12,
  catalog: {
    schemaVersion: 2,
    areas: fullFreshAreasWithOnlyApprovedParentDeltaIfNeeded,
    features: fullFreshFeaturesWithPfExportPlacementAliasesTagsDelta,
    impacts: fullFreshImpactsWithVerifiedEpicDeltaIfNeeded
  }
})
```

These array variables denote the complete preserved arrays, not invented fixture data. `revision` and `updatedAt` are omitted from the request's catalog body. If the fresh revision is no longer 12, recompute from that fresh state; the scenario assertion about 12 is conditional on freshness, not permission to overwrite newer work. A 409 triggers reread and rebase, never just replacing the revision number.

After a successful response I compare returned fields/IDs and new revision, then call `get_product_catalog({pid: "<resolved-pid>"})` again and compare persisted content to the intended diff. A timeout or uncertain result triggers this read before retrying; there is no success claim from a sent request alone. This catalog write does not modify original hierarchy text, requirement statuses, or work statuses. Existing placement approval is reused.

Outcome: identity, source preservation, parent validation, classification limits, full replacement, and reread verification are covered as intended behavior. The unspecified names, topics, IDs, and full arrays prevent a literal executable payload in this fixture; no real save evidence exists.

## catalog-14: one search page is not the replacement inventory

Intended response:

> The returned 20-item page is candidate discovery. I will use the full current catalog to add the approved alias while preserving every existing record, and will verify the saved result. The total of 47 does not mean I have reviewed 47 records.

For this alias-only update I do **not** need to claim a review of every candidate. The immediately necessary next catalog call is:

```js
get_product_catalog({pid: "<resolved-pid>"})
```

I require the full successful response, `remoteSchemaVersion: 2`, a fresh revision, and the live v2 writer. I locate the actual candidate by its returned stable feature ID in that full response, verify that its relevant sources support the known alias, and merge only that authorized alias while retaining its existing alias list. All other features, areas, impacts, IDs and external references remain unchanged. The prompt omits the literal alias/candidate ID, so the payload must use the actual provided values, not fabricated examples.

If selecting the right candidate requires the complete broad result set, or if I report it as fully reviewed, I must finish pagination first. The next calls under that condition are:

```js
search_product_features({pid: "<resolved-pid>", query: originalBroadQuery, offset: 20, limit: 20})
search_product_features({pid: "<resolved-pid>", query: originalBroadQuery, offset: 40, limit: 20})
```

The second call depends on the first page result continuing to report more data; offsets follow the actual returned pagination, and further calls continue if the result has changed. The literal original query is not supplied, so `originalBroadQuery` deliberately means the original actual query, not a guessed new string. Global paging omits `areaId` and `tag` throughout. An optional separate unclassified query uses `areaId: null`; it cannot stand in for the global search. No extra query is required simply to preserve unclassified features, because the full replacement uses the complete GET.

My intended writer is `replace_product_catalog({pid: "<resolved-pid>", expectedRevision: fresh.catalog.revision, catalog: {schemaVersion: 2, areas: fresh.catalog.areas, features: allFreshFeaturesWithOneVerifiedAliasAdded, impacts: fresh.catalog.impacts}})`. Neither `items` nor `total` participates as a replacement payload. I compare the write response and reread the complete catalog to verify the alias and preservation of the original ID sets and unrelated fields. I would claim the alias was persisted only after those observations. If remote format is old/unknown, source reads fail materially, or the write result remains uncertain, I report that exact uncompleted part.

Outcome: first-page misuse is rejected. Pagination is conditional on needing the full candidate set; preservation of the entire catalog always requires the separate complete GET. Source meaning is not inferred from `matchedOn` or `total`.

## Assessment and limitations

| Concern | Observed intended behavior | Evidence limitation |
|---|---|---|
| Remote v1 blocks v2 writing | Explicit block despite normalized schema 2; missing remote field also blocks | No real old/new backend interaction was run |
| Global lookup before creating | Exact no-filter search; UI branch zero is rejected as proof of absence | Candidate/source results are not populated fixtures |
| Stable identities under moves | One feature ID, one primary area, preserved links and project-specific aliases/tags | Full object preservation was reasoned, not executed |
| Pagination and source checking | Page scope reported, relevant sources read before mutation, full GET for writes | No actual page loop, source fetch, conflict, or timeout run |

No contradiction in the four updated intended behaviors was found. This is **not** a claim that four executable tests passed. The fixtures are prompts plus assertions, not response transcripts. In particular, no exact `get_doc` call, actual write body, persisted state, or deployment capability was observed.

The frozen baseline already conservatively rejected scenario A as an unknown schema and already used full-catalog comparison for B. Therefore this evaluation does not establish a measured unsafe-before/safe-after transition or an independent pass-rate improvement. The demonstrated guidance improvement is specificity: normalized read versus remote write capability, a defined global search contract, alias/tag and explicit-null semantics, shallow area trees, and an explicit stable-ID move protocol. The same evaluator and visible assertions can bias results; this report should be labeled a guided sequential behavioral simulation, not a blinded or deployed-agent acceptance run.
