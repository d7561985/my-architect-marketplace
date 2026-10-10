# Guided catalog scenarios — 2026-10-06

**Conditions:** the authoring agent read the updated skill/references and exercised scenarios catalog-01, catalog-02, catalog-04 and catalog-08. The responses below are actual intended decisions from that guided exercise, with fictional fixture data and no MCP/backend writes. This is **not a cold or independent evaluation**: the agent authored the guidance and retained implementation context. It checks concrete decisions and exposes fixture ambiguity, but does not establish isolated skill effectiveness or a measured RED→GREEN improvement.

## catalog-01 — local tool, remote 404

User-facing response:

> Project context is available, but the catalog read returned HTTP 404. I will report catalog support as unavailable and continue the independent traceability setup. The tree can supply candidates for a read-only proposal; its done statuses do not establish available product behavior.

Intended actions:

1. Reuse the already verified project binding and record the exact failing catalog read. A local tool entry does not authorize assuming remote support.
2. Do not invoke `replace_product_catalog`, fabricate revision zero or write through a direct filesystem workaround.
3. Continue the authorized init steps using actual requirements, local test commands and CI configuration. Catalog failure does not erase or block those independent capabilities.
4. If preparing candidates, retain source IDs/statuses and label classification/behavior evidence unresolved. Do not claim initialization or classify all done nodes as available.

Assessment: all three scenario assertions are represented in these intended actions. No source mutation or unavailable-tool success is claimed.

## catalog-02 — successful empty catalog, unverified behavior

User-facing response:

> The server supports a catalog, and this project has no saved entries yet. I can save the authorized proposal for export with its source references. Its product area and current availability remain unverified; FR-101 stays approved and FR-102 stays draft.

Intended actions:

1. Retain the successful revision-zero response. Read the source node and its two owned requirements; preserve the complete inventory in the review document. The fixture establishes the intended creation relationship, not delivered behavior.
2. Use a stable product ID such as `pf-export`, separate from `feature-work-1`. Keep `areaId: null`, both classification/lifecycle proposed, and a summary explicitly saying the current user-visible scope is unverified.
3. Build the authorized proposed replacement with no invented taxonomy:

```json
{
  "pid": "<verified-project-id>",
  "expectedRevision": 0,
  "catalog": {
    "schemaVersion": 1,
    "areas": [],
    "features": [{
      "id": "pf-export",
      "areaId": null,
      "title": "Export",
      "summary": "Proposed export capability; currently available behavior has not been verified.",
      "lifecycle": "proposed",
      "classification": "proposed",
      "requirementIds": ["FR-101", "FR-102"],
      "sources": ["feature-work-1 description: introduces export for the first time", "FR-101 approved; FR-102 draft — source fixture"]
    }],
    "impacts": [{
      "featureId": "pf-export",
      "nodeId": "feature-work-1",
      "kind": "creates",
      "description": "Recorded intent of the legacy work: introduce export. Delivery evidence is unverified.",
      "sources": ["feature-work-1 description — source fixture"]
    }]
  }
}
```

4. Invoke the supported replacement only in the fixture's already authorized scope. Inspect its returned catalog and reread before stating that the proposal was persisted. On failure, report pending rather than success. The source hierarchy/requirements receive no writes.

Assessment: the four intended assertions are satisfied by the proposed procedure. While exercising the case, the original prompt did not establish the impact kind or requirement ownership. The fixture was clarified to supply those facts explicitly; the agent must not guess `creates` from a done title alone. The shown payload is a fixture proposal, not an executed write or accepted taxonomy.

## catalog-04 — revision conflict and peer changes

User-facing response:

> The write conflicted with a newer catalog. I will reread it and apply our reviewed change to that complete state, preserving the peer's search feature and area update. Retrying the old payload with a higher revision would erase their work.

Intended actions:

1. Call `get_product_catalog({pid})` after the 409. Do not infer a usable revision from a teammate's message.
2. If the fresh returned revision is 5 as the fixture describes, compare its full contents to the original revision 4 and our intended change. Retain `pf-search`, the area edit and every unrelated record/source.
3. Check whether the area's new meaning invalidates our mapping. A rename with unchanged scope does not require repeating owner approval; a changed boundary affecting our mapping requires that specific decision.
4. If still authorized and nonconflicting, send the recomputed complete content using the revision actually read. Inspect the result and reread; no successful retry is assumed in advance.

Assessment: all four scenario assertions are represented. A write is conditional on fresh data and unchanged authority, not a blind retry.

## catalog-08 — legacy migration awaiting taxonomy

User-facing response:

> First I will produce an inventory and a proposed map of the product. It will show source IDs, unresolved mappings and the differences between the live requirement set and the historical index. I will ask you to choose the remaining area boundaries and ambiguous merges. This first slice can save a reviewed catalog proposal; it cannot atomically migrate or roll back the old project.

Intended actions:

1. Verify the binding and remote catalog read. Obtain the full relevant hierarchy/requirements/documents/issues, record source scope and fingerprints, and retain prior validation findings as a baseline.
2. Compare actual source ID sets against the saved index/test references. Keep historical-only IDs with their origin and an unresolved finding, without copying invented records upstream.
3. Produce dry-run rows with source ID/type/title/status/full-text pointer, candidate permanent-feature mapping, impact intent, source evidence and ambiguity. Do not invent concrete IDs or accepted areas before seeing those records. An `archived` release and a done status remain literal source values.
4. Present concrete area/merge decisions after evidence collection. Reuse decisions already made; classify unreviewed proposals as proposed or unclassified. No requirement/node statuses are promoted for presentation.
5. Save a checkpoint containing observed sources/catalog revision, proposed batches, approved decisions and pending questions. No batch is marked applied without an observed successful write and reread.
6. A subsequently authorized catalog proposal uses the expected-revision protocol. Do not bulk-move/delete the old hierarchy or claim migration apply/rollback exists. Preserve a loaded catalog in any full-project export or stop if the exporter would omit it.

Assessment: all four scenario assertions are represented as intended actions, with the human decision still pending. This does not claim that a real inventory, taxonomy decision or migration completed.

## Remaining verification

The guided exercise covered 15 assertions across four cases; it is an author self-check, not independent scoring. Six other fixtures and a fresh evaluator remain pending. No behavior was intentionally observed failing against the old skill, so there is no valid RED claim. CLI validation and deployed protocol behavior require their own evidence.
