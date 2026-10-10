> Sanitized evaluator trace: private filesystem paths and the supplied project binding were replaced with generic references. Intended actions are unchanged.

# Frozen baseline: intended behavior

Evaluated 2026-10-06. I read `the frozen baseline scenario fixture` and the frozen skill/catalog/migration guidance before opening the updated plugin. This is a read-only behavioral simulation, not an MCP execution. No remote reads, writes, capability probes, source resolution, or catalog mutation were executed. The only new artifact is this report. `pid: "<resolved-pid>"` comes from the supplied repository binding; a production session would verify that binding through Setup.

## Scenario A: schema 2 response, remoteSchemaVersion 1, requested nested move

My intended answer:

> The saved move is authorized, but the supplied response is outside the catalog format this guidance supports. The reference only defines schema 1, and a nested area cannot be expressed in that contract. I can preserve the existing response and prepare the approved move, but I cannot claim it is saved or send a replacement that drops fields. The locally advertised tools do not establish remote support.

My intended actions, in order:

1. Keep the entire supplied response, including `remoteSchemaVersion: 1`, revision 8, existing IDs, aliases/tags/parent fields, and external `FR-101`. Do not coerce it to schema 1 or strip unknown fields.
2. Do not call `replace_product_catalog`. The frozen reference explicitly treats an unknown format as a reason to stop catalog writes and defines only schema 1. It does not explain the meaning of `remoteSchemaVersion`, normalized schema 2 reads, or how to upgrade remote write capability. I cannot infer those mechanisms from this skill.
3. The next MCP write call is **none**. There is no useful automatic retry: another GET alone cannot supply an absent schema contract. After obtaining compatible guidance/live contract information, the next fresh read would be `get_product_catalog({pid: "<resolved-pid>"})`; any actual call would still be gated by the newly established contract. Read-only inspection of the live `replace_product_catalog` schema would also be required before a later authorized write.
4. Preserve the requested identity `pf-export` in the local proposed diff. The approved destination's exact ID/title/parent are not supplied, so I cannot construct a complete reviewable payload or claim a nested area was created. Do not ask the owner to authorize the already-approved move again.

Claims possible now: an approved move is pending and no catalog write was attempted. No claim of server v2 support, successful save, migration, or source evidence is possible.

Baseline limitation: the write is blocked conservatively because schema 2 is unsupported by the frozen guidance. This is not evidence that the evaluator learned or applied a `remoteSchemaVersion === 1` capability gate; that rule does not appear in the frozen guidance. The result is safe but cannot carry out the requested v2 operation even on a compatible server.

## Scenario B: empty search in selected branch, potential duplicate elsewhere

My intended answer:

> The empty result only covers Operations. I will inspect the whole catalog and the sources of plausible matches before deciding whether bulk publishing needs a new product feature. If the existing capability is under another name, I will keep its product-feature ID and describe this work as a change to it.

My next concrete catalog read would be:

```js
get_product_catalog({pid: "<resolved-pid>"})
```

I would not pass `area-ops` or any other area restriction. The frozen contract describes this GET as the complete catalog, so I would compare the user's requested behavior against **every** returned feature's purpose, summary, area, requirements, and sources, rather than treating the previous branch result as project-wide absence. If Setup has not already been verified in the simulated session, `get_project_context({pid: "<resolved-pid>"})` precedes it.

The scenario also advertises `search_product_features`, but the frozen reference gives no signature or search/pagination semantics for it. I would inspect its actual tool schema before making a call; I will not fabricate parameter names or pretend a call using a guessed contract was performed. Reading the full catalog is the grounded global-discovery route in the baseline.

For plausible matches I would read the original requirements with `get_requirements({pid: "<resolved-pid>"})` (unfiltered) and resolve each returned candidate's relevant document/node references using the discovered live schemas for `get_doc` / `get_node`. Candidate IDs and document IDs are absent from the prompt, so exact dependent calls cannot be filled in yet. A full requirements collection is still read-only; missing external IDs remain recorded, never erased or fabricated. Compare semantics and current supported behavior, not just title equality.

If the purported complete catalog/source export is truncated, filtered, paginated with unread pages, or contains read errors, I would record that discovery is incomplete and continue the exposed pagination before concluding absence. I can conclude only “no matching capability found in the complete currently readable catalog and relevant reviewed sources,” with any explicit gaps; an empty query or one page cannot establish that. The frozen guidance does not supply a search-page loop or explicitly require queries over aliases/tags.

If a match is found elsewhere, retain its product-feature ID, preserve its current proven availability, and represent the new work as `changes` tied to the actual returned work-node ID. If a complete review finds no suitable match, prepare one stable new feature ID, normally `classification: "proposed"`, `lifecycle: "proposed"`, and `areaId: null` where the destination is unresolved. The user's conditional instruction authorizes creating it once the no-match condition is satisfied; it does not approve taxonomy or prove availability. The later write would be `replace_product_catalog({pid: "<resolved-pid>", expectedRevision: fresh.catalog.revision, catalog: {schemaVersion: 1, areas, features, impacts}})` only after a fresh supported full GET, preserving all untouched records. No write can be executed or fully specified from the incomplete scenario alone.

## Evidence boundary

These are my intended responses and call decisions under frozen instructions. They contain no executed-MCP evidence and establish neither real agent runtime reliability nor live server behavior. The baseline was completed before reading updated guidance or expected assertions.
